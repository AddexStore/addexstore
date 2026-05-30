package com.addexstores.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String userAvatar;
    private Long productId;
    private String productName;
    private int rating;
    private String comment;
    private boolean approved;
    private LocalDateTime createdAt;
}
