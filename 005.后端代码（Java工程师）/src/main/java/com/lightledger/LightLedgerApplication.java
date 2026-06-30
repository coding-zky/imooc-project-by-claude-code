package com.lightledger;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.lightledger.mapper")
public class LightLedgerApplication {

    public static void main(String[] args) {
        SpringApplication.run(LightLedgerApplication.class, args);
    }
}
