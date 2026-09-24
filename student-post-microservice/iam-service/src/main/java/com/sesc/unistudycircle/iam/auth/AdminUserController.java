package com.sesc.unistudycircle.iam.auth;

import com.sesc.unistudycircle.iam.user.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/admin/users") @RequiredArgsConstructor
public class AdminUserController {
    private final UserAccountRepository users; private final PasswordEncoder passwords;
    @GetMapping public List<UserView> list(){return users.findAll().stream().map(UserView::from).toList();}
    @PostMapping public ResponseEntity<UserView> add(@Valid @RequestBody CreateUser request){
        if(users.existsByUsername(request.username())||users.existsByEmail(request.email())) return ResponseEntity.status(HttpStatus.CONFLICT).build();
        UserAccount user=new UserAccount(); user.setUsername(request.username());user.setEmail(request.email());user.setPassword(passwords.encode(request.password()));user.setRole(request.role());user.setEnabled(true);return ResponseEntity.status(HttpStatus.CREATED).body(UserView.from(users.save(user)));
    }
    @PatchMapping("/{id}/deactivate") public UserView deactivate(@PathVariable Long id){UserAccount u=get(id);u.setEnabled(false);return UserView.from(users.save(u));}
    @PatchMapping("/{id}/activate") public UserView activate(@PathVariable Long id){UserAccount u=get(id);u.setEnabled(true);return UserView.from(users.save(u));}
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id){users.delete(get(id));}
    private UserAccount get(Long id){return users.findById(id).orElseThrow(()->new IllegalArgumentException("User not found"));}
    public record CreateUser(@NotBlank @Size(min=3,max=50) String username,@NotBlank @Email String email,@NotBlank @Size(min=8,max=100) String password,Role role){}
    public record UserView(Long id,String username,String email,Role role,boolean enabled){static UserView from(UserAccount u){return new UserView(u.getId(),u.getUsername(),u.getEmail(),u.getRole(),u.isEnabled());}}
}
