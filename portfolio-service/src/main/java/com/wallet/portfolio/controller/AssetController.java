package com.wallet.portfolio.controller;

import com.wallet.portfolio.entity.Asset;
import com.wallet.portfolio.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AssetController {

    private final AssetService assetService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Asset>> getAssetsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(assetService.getAssetsByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<Asset> createAsset(@RequestBody Asset asset) {
        return ResponseEntity.ok(assetService.createOrUpdateAsset(asset));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.ok().build();
    }
}
