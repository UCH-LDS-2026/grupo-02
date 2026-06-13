package controllers;
import backend.controllers.AuthController;
import backend.models.RolUsuario;
import backend.models.Usuario;
import backend.repositories.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthControllerTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void login_CuandoCredencialesValidas_DeberiaRetornarUsuario() {
        // ARRANGE
        Usuario usuario = new Usuario();
        usuario.setEmail("mozo@restosoft.com");
        usuario.setPassword("1234");
        usuario.setRol(RolUsuario.MOZO);

        when(usuarioRepository.findByEmail("mozo@restosoft.com")).thenReturn(Optional.of(usuario));

        // ACT
        ResponseEntity<?> respuesta = authController.login("mozo@restosoft.com", "1234");

        // ASSERT
        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertNull(((Usuario) respuesta.getBody()).getPassword()); // La password debe ser null por seguridad
    }

    @Test
    void login_CuandoPasswordIncorrecta_DeberiaRetornarUnauthorized() {
        // ARRANGE
        Usuario usuario = new Usuario();
        usuario.setEmail("mozo@restosoft.com");
        usuario.setPassword("1234");

        when(usuarioRepository.findByEmail("mozo@restosoft.com")).thenReturn(Optional.of(usuario));

        // ACT
        ResponseEntity<?> respuesta = authController.login("mozo@restosoft.com", "9999");

        // ASSERT
        assertEquals(HttpStatus.UNAUTHORIZED, respuesta.getStatusCode());
    }

    @Test
    void login_CuandoUsuarioNoExiste_DeberiaRetornarUnauthorized() {
        // ARRANGE
        when(usuarioRepository.findByEmail("fantasma@restosoft.com")).thenReturn(Optional.empty());

        // ACT
        ResponseEntity<?> respuesta = authController.login("fantasma@restosoft.com", "1234");

        // ASSERT
        assertEquals(HttpStatus.UNAUTHORIZED, respuesta.getStatusCode());
    }
}