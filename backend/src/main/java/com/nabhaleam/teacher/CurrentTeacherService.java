package com.nabhaleam.teacher;

import com.nabhaleam.common.ApiException;
import com.nabhaleam.security.SecurityUtils;
import com.nabhaleam.users.Role;
import com.nabhaleam.users.User;
import com.nabhaleam.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentTeacherService {

    private final UserRepository userRepository;

    public User require() {
        String id = SecurityUtils.currentUserId();
        User user = userRepository.findById(id)
                .orElseThrow(() -> ApiException.unauthorized("Your account could not be found."));
        if (user.getRole() != Role.TEACHER && user.getRole() != Role.ADMIN) {
            throw ApiException.forbidden("This area is available to teachers only.");
        }
        return user;
    }
}
