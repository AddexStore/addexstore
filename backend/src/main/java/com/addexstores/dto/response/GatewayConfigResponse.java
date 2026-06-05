package com.addexstores.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GatewayConfigResponse {
    private Long id;
    private String gateway;
    private boolean enabled;
    private int sortOrder;
    private String displayName;
    private String supportedMethods;
}
