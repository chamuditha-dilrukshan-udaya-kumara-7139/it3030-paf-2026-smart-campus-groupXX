package com.smartcampus.smart_campus_api.dto;

import com.smartcampus.smart_campus_api.model.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatusUpdateDTO {

    @NotNull(message = "Status is required")
    private BookingStatus status;

    private String reason;  // Required if status is REJECTED
}
