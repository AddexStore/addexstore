package com.addexstores.util;

import java.util.List;

public class Constants {

    private Constants() {
    }

    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;

    public static final List<String> SORT_OPTIONS = List.of(
            "createdAt", "updatedAt", "name", "price", "rating"
    );

    public static final String DEFAULT_SORT_FIELD = "createdAt";
    public static final String DEFAULT_SORT_DIRECTION = "desc";

    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_CUSTOMER = "CUSTOMER";

    public static final String DATE_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
    public static final String DATE_FORMAT = "yyyy-MM-dd";
}
