package com.wallet.portfolio.inwallet_service.service;

import com.wallet.portfolio.inwallet_service.entity.Asset;
import com.wallet.portfolio.inwallet_service.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;

    public List<Asset> getAssetsByUserId(Long userId) {
        return assetRepository.findByUserId(userId);
    }

    public Asset createAsset(Asset asset) {
        return assetRepository.save(asset);
    }
}
