package com.nabhaleam.users;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByRole(Role role);

    List<User> findByRoleAndActiveTrue(Role role);

    List<User> findByRoleAndClassIdAndActiveTrue(Role role, String classId);

    long countByRole(Role role);

    long countByRoleAndActiveTrue(Role role);
}
