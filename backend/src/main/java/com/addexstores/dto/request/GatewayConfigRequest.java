package com.addexstores.dto.request;

import lombok.Data;

@Data
public class GatewayConfigRequest {
    private boolean enabled;
    private int sortOrder;
    private String displayName;
    private String supportedMethods;
}
