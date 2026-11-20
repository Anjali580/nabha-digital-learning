package com.nabhaleam.admin.dto;

import jakarta.validation.constraints.NotNull;

public record AdminUserStatusRequest(
        @NotNull(message = "Choose whether the account should be active.")
        Boolean active
) {
}
