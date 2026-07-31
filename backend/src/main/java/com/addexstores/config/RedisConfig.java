package com.addexstores.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.time.Duration;

@Configuration
public class RedisConfig {

    @Value("${spring.data.redis.url:}")
    private String redisUrl;

    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    @Value("${spring.data.redis.password:}")
    private String redisPassword;

    @Value("${spring.data.redis.ssl.enabled:false}")
    private boolean sslEnabled;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        if (StringUtils.hasText(redisUrl)) {
            return createFromUrl(redisUrl);
        }

        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName(redisHost);
        config.setPort(redisPort);
        if (redisPassword != null && !redisPassword.isBlank()) {
            config.setPassword(redisPassword);
        }

        if (sslEnabled) {
            LettuceClientConfiguration clientConfig = LettuceClientConfiguration.builder()
                    .useSsl()
                    .build();
            return new LettuceConnectionFactory(config, clientConfig);
        }

        return new LettuceConnectionFactory(config);
    }

    private RedisConnectionFactory createFromUrl(String url) {
        try {
            URI uri = new URI(url);
            String host = uri.getHost();
            int port = uri.getPort();
            String password = uri.getUserInfo();

            RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
            config.setHostName(host);
            config.setPort(port);
            if (password != null && !password.isBlank()) {
                config.setPassword(password);
            }

            boolean useSsl = "rediss".equals(uri.getScheme());
            if (useSsl) {
                LettuceClientConfiguration clientConfig = LettuceClientConfiguration.builder()
                        .commandTimeout(Duration.ofSeconds(5))
                        .useSsl()
                        .build();
                return new LettuceConnectionFactory(config, clientConfig);
            }

            return new LettuceConnectionFactory(config);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid REDIS_URL: " + url, e);
        }
    }
}
