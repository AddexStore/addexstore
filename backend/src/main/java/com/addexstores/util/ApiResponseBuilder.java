package com.addexstores.util;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

public class ApiResponseBuilder {

    public static ResponseEntity<Map<String, Object>> success(Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        response.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    public static ResponseEntity<Map<String, Object>> success(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        response.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    public static ResponseEntity<Map<String, Object>> created(Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        response.put("timestamp", LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    public static ResponseEntity<Map<String, Object>> deleted() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Deleted successfully");
        response.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    public static ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("timestamp", LocalDateTime.now());
        return ResponseEntity.status(status).body(response);
    }

    public static ResponseEntity<Map<String, Object>> error(String message) {
        return error(HttpStatus.BAD_REQUEST, message);
    }

    public static ResponseEntity<Map<String, Object>> error(String message, Map<String, String> errors) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("errors", errors);
        response.put("timestamp", LocalDateTime.now());
        return ResponseEntity.badRequest().body(response);
    }

    public static Map<String, Object> successMap(Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", data);
        response.put("timestamp", LocalDateTime.now());
        return response;
    }
}
