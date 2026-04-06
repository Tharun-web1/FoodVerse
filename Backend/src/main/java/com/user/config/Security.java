package com.user.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.user.filter.JwtFilter;




@Configuration
public class Security {
	@Autowired
	private UserDetailsService userDetailsService;
	
	@Autowired
	private JwtFilter jwtFilter;
	
	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception
	{
		
		http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
			
		http.authorizeHttpRequests(req->req
				.requestMatchers("/auth/**","/error","/getimage/*","/restaurants/contactform", "/delivery-orders/**", "/partner/auth/**").permitAll()
				.requestMatchers(HttpMethod.GET, 
						"/restaurants", "/restaurants/*", "/restaurants/*/itemimg", 
						"/restaurants/*/items", "/restaurants/category/*", 
						"/restaurants/search").permitAll()
				.requestMatchers("/restaurants/*/image", "/restaurants/tindoc/*", "/restaurants/licencedoc/*", "/restaurants/logoimage/*").permitAll()
				.requestMatchers("/users/me/**","/users/*/profile-image").permitAll()
				.requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN")
				.anyRequest().authenticated());
		http.sessionManagement(ses->ses.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
		http.csrf(csrf->csrf.disable());
		http.formLogin(login->login.disable());
		http.httpBasic(Customizer.withDefaults());
		http.cors(Customizer.withDefaults());
	
		return http.build();
	}
	
	@Bean
	public AuthenticationProvider authProvider() {
		DaoAuthenticationProvider provider=new DaoAuthenticationProvider();
		provider.setUserDetailsService(userDetailsService);
		provider.setPasswordEncoder(NoOpPasswordEncoder.getInstance());
		return provider;
	}
	
	
	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
		return config.getAuthenticationManager();
		
	}
	
	
	
	
	
	
	
	
}