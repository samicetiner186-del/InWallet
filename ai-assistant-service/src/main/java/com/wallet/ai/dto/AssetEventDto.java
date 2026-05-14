package com.wallet.ai.dto;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Portfolio servisinden gelen asset-events topic payload'ı.
 */
public class AssetEventDto {
    private Long userId;
    private String symbol;
    private String type;
    private BigDecimal quantity;
    private BigDecimal price;
    private String action;
    private Instant timestamp;

    public AssetEventDto() {}

    public Long getUserId()          { return userId; }
    public String getSymbol()        { return symbol; }
    public String getType()          { return type; }
    public BigDecimal getQuantity()  { return quantity; }
    public BigDecimal getPrice()     { return price; }
    public String getAction()        { return action; }
    public Instant getTimestamp()    { return timestamp; }

    public void setUserId(Long userId)          { this.userId = userId; }
    public void setSymbol(String symbol)        { this.symbol = symbol; }
    public void setType(String type)            { this.type = type; }
    public void setQuantity(BigDecimal q)       { this.quantity = q; }
    public void setPrice(BigDecimal price)      { this.price = price; }
    public void setAction(String action)        { this.action = action; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
