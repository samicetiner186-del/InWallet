package com.wallet.portfolio.inwallet_service.controller;

import com.wallet.portfolio.inwallet_service.entity.Asset;
import com.wallet.portfolio.inwallet_service.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Asset>> getAssetsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(assetService.getAssetsByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<Asset> createAsset(@RequestBody Asset asset) {
        return ResponseEntity.ok(assetService.createAsset(asset));
    }
}
