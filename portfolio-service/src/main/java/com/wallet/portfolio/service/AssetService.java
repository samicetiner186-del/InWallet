package com.wallet.portfolio.service;

import com.wallet.portfolio.dto.AssetEvent;
import com.wallet.portfolio.entity.Asset;
import com.wallet.portfolio.kafka.AssetEventProducer;
import com.wallet.portfolio.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final MarketDataService marketDataService;
    private final AssetEventProducer assetEventProducer;

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
            
            Asset saved = assetRepository.save(existingAsset);
            publishAssetEvent(saved, "UPDATED");
            return saved;
        } else {
            if (newAsset.getAverageBuyPrice() == null) newAsset.setAverageBuyPrice(BigDecimal.ZERO);
            if (newAsset.getQuantity() == null) newAsset.setQuantity(BigDecimal.ZERO);
            Asset saved = assetRepository.save(newAsset);
            publishAssetEvent(saved, "ADDED");
            return saved;
        }
    }

    @Transactional
    @CacheEvict(value = "assets", allEntries = true)
    public void deleteAsset(Long id) {
        assetRepository.deleteById(id);
    }

    private void publishAssetEvent(Asset asset, String action) {
        try {
            if (asset.getUser() == null) return;
            AssetEvent event = AssetEvent.builder()
                    .userId(asset.getUser().getId())
                    .symbol(asset.getSymbol())
                    .type(asset.getType())
                    .quantity(asset.getQuantity())
                    .price(asset.getAverageBuyPrice())
                    .action(action)
                    .timestamp(Instant.now())
                    .build();
            assetEventProducer.sendAssetEvent(event);
        } catch (Exception e) {
            // Non-critical: asset işlemi başarılı oldu, sadece event gönderilmedi
        }
    }
}
