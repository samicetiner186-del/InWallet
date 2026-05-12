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
            
            // Ağırlıklı Ortalama Maliyet Hesaplama
            // Yeni Maliyet = ((Eski Adet * Eski Fiyat) + (Yeni Adet * Yeni Fiyat)) / (Toplam Adet)
            BigDecimal totalQuantity = existingAsset.getQuantity().add(newAsset.getQuantity());
            
            BigDecimal oldTotalValue = existingAsset.getQuantity().multiply(existingAsset.getAverageBuyPrice());
            BigDecimal newTotalValue = newAsset.getQuantity().multiply(newAsset.getAverageBuyPrice());
            
            BigDecimal newAvgPrice = oldTotalValue.add(newTotalValue)
                    .divide(totalQuantity, 4, RoundingMode.HALF_UP);
            
            existingAsset.setQuantity(totalQuantity);
            existingAsset.setAverageBuyPrice(newAvgPrice);
            existingAsset.setType(newAsset.getType()); // Tür değişmiş olabilir
            
            return assetRepository.save(existingAsset);
        } else {
            return assetRepository.save(newAsset);
        }
    }

    @Transactional
    @CacheEvict(value = "assets", allEntries = true)
    public void deleteAsset(Long id) {
        assetRepository.deleteById(id);
    }
}
