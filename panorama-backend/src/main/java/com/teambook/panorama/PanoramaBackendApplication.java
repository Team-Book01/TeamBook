package com.teambook.panorama;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
@ConfigurationPropertiesScan
public class PanoramaBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(PanoramaBackendApplication.class, args);
	}

}
