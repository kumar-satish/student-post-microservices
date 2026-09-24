package com.sesc.unistudycircle.iam.config;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class DevToolsController {

    @GetMapping(
            value = "/.well-known/appspecific/com.chrome.devtools.json",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public Map<String, Object> devTools() {
        return Map.of();
    }
}