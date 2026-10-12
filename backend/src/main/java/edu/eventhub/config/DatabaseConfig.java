package edu.eventhub.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String url = properties.getUrl();
        String username = properties.getUsername();
        String password = properties.getPassword();

        // 1. Check if MYSQL_URL is set in environment (e.g. from Railway MySQL service)
        String mysqlUrlEnv = System.getenv("MYSQL_URL");
        if ((!StringUtils.hasText(url) || url.startsWith("mysql://")) && StringUtils.hasText(mysqlUrlEnv)) {
            url = mysqlUrlEnv;
        }

        // 2. If the URL has 'mysql://' protocol (common Railway format), parse it into JDBC format
        if (StringUtils.hasText(url) && url.startsWith("mysql://")) {
            try {
                URI uri = new URI(url);
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 3306 : uri.getPort();
                String path = uri.getPath();
                if (path != null && path.startsWith("/")) {
                    path = path.substring(1);
                }
                String query = uri.getQuery();

                String userInfo = uri.getUserInfo();
                if (userInfo != null) {
                    String[] userParts = userInfo.split(":", 2);
                    if (userParts.length > 0 && !StringUtils.hasText(username)) {
                        username = userParts[0];
                    }
                    if (userParts.length > 1 && !StringUtils.hasText(password)) {
                        password = userParts[1];
                    }
                }

                String params = StringUtils.hasText(query)
                    ? "?" + query
                    : "?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";

                url = "jdbc:mysql://" + host + ":" + port + "/" + path + params;
                log.info("Successfully converted Railway MYSQL_URL to JDBC URL: jdbc:mysql://{}:{}/{}", host, port, path);
            } catch (Exception e) {
                log.warn("Could not parse mysql:// URL, falling back: {}", e.getMessage());
            }
        }

        // 3. Fallback for Railway's individual host/port variables if URL was still not resolved
        String host = System.getenv("MYSQLHOST");
        if (!StringUtils.hasText(url) && StringUtils.hasText(host)) {
            String port = System.getenv("MYSQLPORT");
            String database = System.getenv("MYSQLDATABASE");
            if (!StringUtils.hasText(port)) port = "3306";
            if (!StringUtils.hasText(database)) database = "railway";
            if (!StringUtils.hasText(username)) username = System.getenv("MYSQLUSER");
            if (!StringUtils.hasText(password)) password = System.getenv("MYSQLPASSWORD");

            url = "jdbc:mysql://" + host + ":" + port + "/" + database
                + "?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
            log.info("Constructed JDBC URL from Railway MySQL environment variables: {}", url);
        }

        HikariDataSource dataSource = properties.initializeDataSourceBuilder().type(HikariDataSource.class).build();
        if (StringUtils.hasText(url)) {
            dataSource.setJdbcUrl(url);
        }
        if (StringUtils.hasText(username)) {
            dataSource.setUsername(username);
        }
        if (password != null) {
            dataSource.setPassword(password);
        }
        dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        return dataSource;
    }
}
