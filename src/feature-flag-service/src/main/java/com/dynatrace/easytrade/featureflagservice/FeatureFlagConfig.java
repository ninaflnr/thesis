package com.dynatrace.easytrade.featureflagservice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.*;
import java.util.stream.*;

@Configuration
public class FeatureFlagConfig {
    @Value("${app.flags.enableModify}")
    private String enableModify;
    @Value("${app.flags.enableDbNotResponding}")
    private String enableDbNotResponding;
    @Value("${app.flags.enableErgoAggregatorSlowdown}")
    private String enableErgoAggregatorSlowdown;
    @Value("${app.flags.enableFactoryCrisis}")
    private String enableFactoryCrisis;
    @Value("${app.flags.enableFrontendModify}")
    private String enableFrontendModify;
    @Value("${app.flags.enableCreditCardMeltdown}")
    private String enableCreditCardMeltdown;
    @Value("${app.flags.enableHighCpuUsage}")
    private String enableHighCpuUsage;
    @Value("${app.flags.enableDelaySimulation}")
    private String enableDelaySimulation;
    @Value("${app.flags.enableHighPayloadError:false}")
    private String enableHighPayloadError;
    @Value("${app.flags.enableLargePayload}")
    private String enableLargePayload;
    @Value("${app.flags.enableUndefinedVariableError}")
    private String enableUndefinedVariableError;
    @Value("${app.flags.enableSessionExpiredError}")
    private String enableSessionExpiredError;
    @Value("${app.flags.enableRateLimitError}")
    private String enableRateLimitError;
    @Value("${app.flags.enableTimeoutError}")
    private String enableTimeoutError;

    @Bean
    public Map<String, List<Flag>> flagRegistry() {
        boolean isModifiable = Boolean.parseBoolean(enableModify);

        // Define all flags with their logical groups
        List<Flag> allFlags = List.of(
                new Flag(
                        "frontend_feature_flag_management",
                        Boolean.parseBoolean(enableFrontendModify),
                        "Frontend feature flag management",
                        "When enabled allows controlling problem pattern feature flags from the main app UI.",
                        false,
                        "config",
                        "Feature Management" // Logical group
                ),
                new Flag(
                        "db_not_responding",
                        Boolean.parseBoolean(enableDbNotResponding),
                        "DB not responding",
                        "When enabled, the DB not responding will be simulated, causing errors when creating new transactions.",
                        isModifiable,
                        "problem_pattern",
                        "Database Issues" // Logical group
                ),
                new Flag(
                        "ergo_aggregator_slowdown",
                        Boolean.parseBoolean(enableErgoAggregatorSlowdown),
                        "Ergo aggregator slowdown",
                        "When enabled, the OfferService will respond with delays to 2 out of 5 AggregatorServices querying it.",
                        isModifiable,
                        "problem_pattern",
                        "Database Issues" // Logical group
                ),
                new Flag(
                        "factory_crisis",
                        Boolean.parseBoolean(enableFactoryCrisis),
                        "Factory crisis",
                        "When enabled, the factory won't produce new cards, causing the Third Party Service to fail.",
                        isModifiable,
                        "problem_pattern",
                        "Feature Management" // Logical group
                ),
                new Flag(
                        "credit_card_meltdown",
                        Boolean.parseBoolean(enableCreditCardMeltdown),
                        "OrderController service error",
                        "When enabled, checking the latest status will result in a division by 0 error.",
                        isModifiable,
                        "problem_pattern",
                        "Error Handling" // Logical group
                ),
                new Flag(
                        "high_cpu_usage",
                        Boolean.parseBoolean(enableHighCpuUsage),
                        "K8s: high CPU usage",
                        "Causes a slowdown of broker-service response time and increases CPU usage.",
                        isModifiable,
                        "problem_pattern",
                        "Performance Issues" // Logical group
                ),
                new Flag(
                        "delay_simulation",
                        Boolean.parseBoolean(enableDelaySimulation),
                        "Simulate delays in broker service",
                        "When enabled, the broker service will introduce artificial delays to simulate network latency.",
                        isModifiable,
                        "problem_pattern",
                        "Performance Issues" // Logical group
                ),
                new Flag(
                        "large_payload",
                        Boolean.parseBoolean(enableLargePayload),
                        "Create large payload response",
                        "When enabled, the credit card service will respond with a large payload response.",
                        isModifiable,
                        "problem_pattern",
                        "Payload Issues" // Logical group
                ),
                new Flag(
                        "undefined_variable_error",
                        Boolean.parseBoolean(enableUndefinedVariableError),
                        "Simulate undefined variable error",
                        "When enabled, the response will simulate a JavaScript undefined variable error.",
                        isModifiable,
                        "problem_pattern",
                        "Payload Issues" // Logical group
                ),
                new Flag(
                        "session_expired",
                        Boolean.parseBoolean(enableSessionExpiredError),
                        "Simulate expired Session",
                        "When enabled, the response will simulate an expired session.",
                        isModifiable,
                        "problem_pattern",
                        "Error Handling" // Logical group
                ),
                new Flag(
                        "rate_limit_error",
                        Boolean.parseBoolean(enableRateLimitError),
                        "Simulate rate limit error",
                        "When enabled, there will be a rate limit error.",
                        isModifiable,
                        "problem_pattern",
                        "Error Handling" // Logical group
                ),
                new Flag(
                        "timeout_error",
                        Boolean.parseBoolean(enableTimeoutError),
                        "Simulate timeout error",
                        "When enabled, it will simulate a timeout error due to a large delay.",
                        isModifiable,
                        "problem_pattern",
                        "Error Handling" // Logical group
                )
        );

        // Group flags by their logical group
        Map<String, List<Flag>> groupedFlags = allFlags.stream()
                .collect(Collectors.groupingBy(Flag::getGroup));

        // Debugging: Log grouped flags
        groupedFlags.forEach((group, flags) -> {
            System.out.println("Group: " + group);
            flags.forEach(flag -> System.out.println("  - Flag: " + flag.getName()));
        });

        return groupedFlags;
    }
}
