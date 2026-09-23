package com.sesc.unistudycircle.iam.auth;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Development landing endpoint for the IAM service.
 */
@RestController
public class IamHomeController {

    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
                "service", "UniStudyCircle IAM service",
                "status", "running",
                "login", "/login",
                "oidcDiscovery", "/.well-known/openid-configuration",
                "health", "/actuator/health"
        );
    }
}
