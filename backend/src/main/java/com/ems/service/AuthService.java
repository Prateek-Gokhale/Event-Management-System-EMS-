package com.ems.service;

import com.ems.dto.auth.AuthResponse;
import com.ems.dto.auth.LoginRequest;
import com.ems.dto.auth.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
