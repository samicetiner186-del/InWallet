package com.wallet.portfolio.repository;

import com.wallet.portfolio.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByUserId(Long userId);
    List<Asset> findByUserIdAndType(Long userId, String type);
    java.util.Optional<Asset> findByUserIdAndSymbol(Long userId, String symbol);
}
