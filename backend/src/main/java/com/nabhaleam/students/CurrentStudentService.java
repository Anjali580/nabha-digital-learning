package com.nabhaleam.students;

import com.nabhaleam.common.ApiException;
import com.nabhaleam.security.SecurityUtils;
import com.nabhaleam.users.User;
import com.nabhaleam.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentStudentService {

    private final UserRepository userRepository;

    public User require() {
        String id = SecurityUtils.currentUserId();
        User user = userRepository.findById(id)
                .orElseThrow(() -> ApiException.unauthorized("Your account could not be found."));
        if (user.getRole() != com.nabhaleam.users.Role.STUDENT) {
            throw ApiException.forbidden("This area is available to students only.");
        }
        return user;
    }

    public String requireId() {
        return require().getId();
    }
}
