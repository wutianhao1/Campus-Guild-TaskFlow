package com.campusguild.server.service;

import com.campusguild.server.config.JwtTokenProvider;
import com.campusguild.server.exception.BusinessException;
import com.campusguild.server.model.dto.LoginRequest;
import com.campusguild.server.model.dto.LoginResponse;
import com.campusguild.server.model.dto.RegisterRequest;
import com.campusguild.server.model.dto.UserDTO;
import com.campusguild.server.model.entity.User;
import com.campusguild.server.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setPassword("password123");
        registerRequest.setNickname("测试用户");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password123");

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setNickname("测试用户");
        testUser.setGuildLevel(1);
        testUser.setPoints(0);
        testUser.setExperience(0);
        testUser.setRole("USER");
        testUser.setBanned(false);
        testUser.setPasswordHash("salt$hash");
    }

    @Test
    void register_Success() {
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        UserDTO result = authService.register(registerRequest);

        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals("测试用户", result.getNickname());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_UsernameExists_ThrowsException() {
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            authService.register(registerRequest);
        });

        assertEquals("用户名已存在", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_Success() throws Exception {
        // 预先计算正确的 hash: SHA-256(salt + password)
        // salt="salt", password="password123"
        java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
        md.update("salt".getBytes());
        byte[] hashed = md.digest("password123".getBytes());
        String passwordHash = java.util.Base64.getEncoder().encodeToString(hashed);
        testUser.setPasswordHash("salt$" + passwordHash);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtTokenProvider.generateToken(1L, "testuser", "USER")).thenReturn("jwt-token");

        LoginResponse result = authService.login(loginRequest);

        assertNotNull(result);
        assertEquals("jwt-token", result.getToken());
        assertEquals("testuser", result.getUser().getUsername());
    }

    @Test
    void login_UserNotFound_ThrowsException() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            authService.login(loginRequest);
        });

        assertEquals("用户名或密码错误", exception.getMessage());
    }

    @Test
    void login_WrongPassword_ThrowsException() {
        testUser.setPasswordHash("salt$wronghash");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            authService.login(loginRequest);
        });

        assertEquals("用户名或密码错误", exception.getMessage());
    }

    @Test
    void getUserById_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        UserDTO result = authService.getUserById(1L);

        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
    }

    @Test
    void getUserById_NotFound_ThrowsException() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            authService.getUserById(1L);
        });

        assertEquals("用户不存在", exception.getMessage());
    }
}