package com.wallet.ai.controller;

import com.wallet.ai.service.AIAssistantService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai")
public class AIChatController {

    private final AIAssistantService aiAssistantService;

    public AIChatController(AIAssistantService aiAssistantService) {
        this.aiAssistantService = aiAssistantService;
    }

    @PostMapping("/chat")
    public ResponseEntity<String> chat(@RequestParam String message, @RequestParam Long userId) {
        String response = aiAssistantService.chatWithAgent(message, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/chat/audio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> chatWithVoice(@RequestParam("audio") MultipartFile audioFile, 
                                                @RequestParam("userId") Long userId) {
        try {
            Resource audioResource = audioFile.getResource();
            byte[] responseAudio = aiAssistantService.chatWithVoice(audioResource, userId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("audio/mpeg"));
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(responseAudio);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
