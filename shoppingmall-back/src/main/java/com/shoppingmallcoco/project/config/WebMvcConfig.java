package com.shoppingmallcoco.project.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 업로드된 이미지 파일 서빙
        registry.addResourceHandler("/images/**")
            .addResourceLocations("file:///" + uploadDir);
        
        // React 정적 리소스 서빙 (CSS, JS, 이미지 등)
        registry.addResourceHandler("/static/**")
            .addResourceLocations("classpath:/static/static/");
        
        // index.js 및 기타 정적 파일들 서빙 (WAR 파일 내부에서도 작동하도록)
        registry.addResourceHandler("/index.js", "/favicon.ico", "/manifest.json", "/logo*.png", "/robots.txt", "/asset-manifest.json", "/prd_placeholder.png")
            .addResourceLocations("classpath:/static/", "classpath:/META-INF/resources/");
        
        // 모든 경로를 index.js로 fallback (SPA 라우팅)
        registry.addResourceHandler("/**")
            .addResourceLocations("classpath:/static/")
            .resourceChain(true)
            .addResolver(new PathResourceResolver() {
                @Override
                protected Resource getResource(String resourcePath, Resource location) throws IOException {
                    // API 경로는 제외
                    if (resourcePath.startsWith("api/")) {
                        return null;
                    }
                    
                    // 정적 리소스 경로는 제외
                    if (resourcePath.startsWith("static/") || resourcePath.startsWith("images/")) {
                        return null;
                    }
                    
                    // 정적 파일 확장자가 있는 경로는 제외
                    if (resourcePath.contains(".")) {
                        String extension = resourcePath.substring(resourcePath.lastIndexOf(".") + 1);
                        if (extension.matches("(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|txt|map)")) {
                            Resource requestedResource = location.createRelative(resourcePath);
                            if (requestedResource.exists() && requestedResource.isReadable()) {
                                return requestedResource;
                            }
                            return null;
                        }
                    }
                    
                    // 모든 경로는 index.js로 fallback
                    return new ClassPathResource("/static/index.js");
                }
            });
    }
}