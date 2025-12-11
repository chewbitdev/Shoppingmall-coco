package com.shoppingmallcoco.project.config;

import com.siot.IamportRestClient.IamportClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class IamportConfig {
    // 포트원 테스트용 키
    private String apiKey = "2325122621874422"; 
    private String apiSecret = "zqakFk09pez61EK3CgazLFgjPgE7HrRz9eq8LaLaZbIs7WiM1W45TPXFJ7K8t8slWGIear8AieA9r9t0"; 

    @Bean
    public IamportClient iamportClient() {
        return new IamportClient(apiKey, apiSecret);
    }
}