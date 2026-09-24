package com.sesc.unistudycircle.iam.config;

import com.sesc.unistudycircle.iam.user.Role;
import com.sesc.unistudycircle.iam.user.UserAccount;
import com.sesc.unistudycircle.iam.user.UserAccountRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;

import org.springframework.security.web.SecurityFilterChain;

import java.util.UUID;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * =========================================================
     * Application Security
     * =========================================================
     *
     * Handles our own API endpoints such as:
     *
     * POST /api/auth/register
     *
     * Registration is public.
     */
    @Bean
    @Order(2)
    SecurityFilterChain applicationSecurityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf
                        .ignoringRequestMatchers(
                                "/api/auth/register",
                                "/api/admin/**"
                        )
                )
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(authorize -> authorize

                        // Public registration endpoint
                        .requestMatchers(
                                "/",
                                "/api/auth/register"
                        ).permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Public health check
                        .requestMatchers(
                                "/actuator/health"
                        ).permitAll()

                        // Spring error endpoint
                        .requestMatchers(
                                "/error"
                        ).permitAll()
                        .requestMatchers("/.well-known/appspecific/com.chrome.devtools.json")
                        .permitAll()

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )

                .formLogin(Customizer.withDefaults())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));

        return http.build();
    }

    private JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            var roles = jwt.getClaimAsStringList("roles");
            return roles == null ? java.util.List.of() : roles.stream()
                    .<org.springframework.security.core.GrantedAuthority>map(role -> new SimpleGrantedAuthority("ROLE_" + role)).toList();
        });
        return converter;
    }


    /**
     * =========================================================
     * Password Encoder
     * =========================================================
     */
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    /**
     * =========================================================
     * OAuth2 Client
     * =========================================================
     */
    @Bean
    RegisteredClientRepository registeredClientRepository() {

        RegisteredClient studentWebClient =
                RegisteredClient.withId(
                                UUID.randomUUID().toString()
                        )
                        .clientId("student-web")
                        .clientSecret("{noop}student-web-secret")
                        .clientAuthenticationMethod(
                                ClientAuthenticationMethod.CLIENT_SECRET_BASIC
                        )
                        .authorizationGrantType(
                                AuthorizationGrantType.AUTHORIZATION_CODE
                        )
                        .authorizationGrantType(
                                AuthorizationGrantType.REFRESH_TOKEN
                        )
                        .redirectUri(
                                "http://127.0.0.1:8080/login/oauth2/code/student-web"
                        )
                        .scope("openid")
                        .scope("profile")
                        .scope("student:read")
                        .scope("student:write")
                        .scope("topic:read")
                        .scope("topic:create")
                        .build();


        RegisteredClient reactTestClient =
                RegisteredClient.withId(
                                UUID.randomUUID().toString()
                        )
                        .clientId("iam-test-ui")

                        // Public browser application:
                        // no client secret
                        .clientAuthenticationMethod(
                                ClientAuthenticationMethod.NONE
                        )

                        .authorizationGrantType(
                                AuthorizationGrantType.AUTHORIZATION_CODE
                        )

                        .redirectUri(
                                "http://localhost:3000/auth/callback"
                        )

                        .postLogoutRedirectUri(
                                "http://localhost:3000/"
                        )

                        .scope("openid")
                        .scope("profile")

                        .clientSettings(
                                org.springframework.security.oauth2.server.authorization.settings.ClientSettings.builder()
                                        .requireProofKey(true)
                                        .requireAuthorizationConsent(false)
                                        .build()
                        )

                        .build();


        return new InMemoryRegisteredClientRepository(
                studentWebClient,
                reactTestClient
        );
    }

    /**
     * =========================================================
     * Seed Default Admin
     * =========================================================
     */
    @Bean
    CommandLineRunner seedAdmin(
            UserAccountRepository repository,
            PasswordEncoder encoder) {

        return args -> {

            if (repository.findByUsername("admin").isEmpty()) {

                UserAccount admin = new UserAccount();

                admin.setUsername("admin");
                admin.setEmail("admin@example.com");

                admin.setPassword(
                        encoder.encode("admin123")
                );

                admin.setRole(Role.ADMIN);
                admin.setEnabled(true);

                repository.save(admin);
            }
        };
    }
}
