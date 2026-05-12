package com.wallet.portfolio.service;

import com.wallet.portfolio.entity.Asset;
import com.wallet.portfolio.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final MarketDataService marketDataService;

    @Cacheable(value = "assets", key = "#userId")
    public List<Asset> getAssetsByUserId(Long userId) {
        List<Asset> assets = assetRepository.findByUserId(userId);
        // Her varlık için anlık fiyatı güncelle
        for (Asset asset : assets) {
            BigDecimal currentPrice = marketDataService.getPriceForSymbol(asset.getSymbol());
            if (currentPrice != null && currentPrice.compareTo(BigDecimal.ZERO) > 0) {
                asset.setCurrentPrice(currentPrice);
            }
        }
        return assets;
    }

    public Asset getAssetById(Long id) {
        return assetRepository.findById(id).orElse(null);
    }

    @Transactional
    @CacheEvict(value = "assets", allEntries = true)
    public Asset createOrUpdateAsset(Asset newAsset) {
        if (newAsset.getUser() == null || newAsset.getSymbol() == null) {
            throw new IllegalArgumentException("Kullanıcı ve Sembol bilgisi zorunludur.");
        }

        Optional<Asset> existingAssetOpt = assetRepository.findByUserIdAndSymbol(
                newAsset.getUser().getId(), newAsset.getSymbol());

        if (existingAssetOpt.isPresent()) {
            Asset existingAsset = existingAssetOpt.get();
            BigDecimal newQuantity = newAsset.getQuantity() != null ? newAsset.getQuantity() : BigDecimal.ZERO;
            BigDecimal totalQuantity = existingAsset.getQuantity().add(newQuantity);
            
            // Eğer yeni miktar 0 veya negatifse varlığı silebiliriz veya 0 olarak bırakabiliriz
            if (totalQuantity.compareTo(BigDecimal.ZERO) <= 0) {
                existingAsset.setQuantity(BigDecimal.ZERO);
                // Ortalama fiyatı sıfırlamaya gerek yok, kalsın
                return assetRepository.save(existingAsset);
            }

            // Sadece alış (BUY) işlemlerinde maliyet güncellenir.
            // Satışta (miktar azaldığında) maliyet değişmez.
            if (newQuantity.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal oldTotalValue = existingAsset.getQuantity().multiply(existingAsset.getAverageBuyPrice());
                BigDecimal newTotalValue = newQuantity.multiply(newAsset.getAverageBuyPrice() != null ? newAsset.getAverageBuyPrice() : BigDecimal.ZERO);
                
                BigDecimal newAvgPrice = oldTotalValue.add(newTotalValue)
                        .divide(totalQuantity, 4, RoundingMode.HALF_UP);
                existingAsset.setAverageBuyPrice(newAvgPrice);
            }
            
            existingAsset.setQuantity(totalQuantity);
            if (newAsset.getType() != null) existingAsset.setType(newAsset.getType());
            
            return assetRepository.save(existingAsset);
        } else {
            if (newAsset.getAverageBuyPrice() == null) newAsset.setAverageBuyPrice(BigDecimal.ZERO);
            if (newAsset.getQuantity() == null) newAsset.setQuantity(BigDecimal.ZERO);
            return assetRepository.save(newAsset);
        }
    }

    @Transactional
    @CacheEvict(value = "assets", allEntries = true)
    public void deleteAsset(Long id) {
        assetRepository.deleteById(id);
    }
}
