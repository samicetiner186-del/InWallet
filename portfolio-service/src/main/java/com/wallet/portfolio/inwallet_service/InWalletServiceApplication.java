package com.wallet.portfolio.inwallet_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class InWalletServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(InWalletServiceApplication.class, args);
	}

}
