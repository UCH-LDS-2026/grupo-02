/*package controllers;
import backend.controllers.MesaController;
import backend.models.EstadoMesa;
import backend.models.HistorialMesa;
import backend.models.Mesa;
import backend.repositories.HistorialMesaRepository;
import backend.repositories.MesaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class MesaControllerTest {

    @Mock
    private MesaRepository mesaRepository;

    @Mock
    private HistorialMesaRepository historialMesaRepository;

    @InjectMocks
    private MesaController mesaController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void cambiarEstado_CuandoMesaExiste_DeberiaActualizarYGuardarHistorial() {
        Mesa mesaSimulada = new Mesa();
        mesaSimulada.setIdMesa(1);
        mesaSimulada.setEstado(EstadoMesa.LIBRE);
        
        when(mesaRepository.findById(1)).thenReturn(Optional.of(mesaSimulada));

        ResponseEntity<Mesa> respuesta = mesaController.cambiarEstado(1, EstadoMesa.OCUPADA);

        assertEquals(HttpStatus.OK, respuesta.getStatusCode());
        assertEquals(EstadoMesa.OCUPADA, respuesta.getBody().getEstado());
        verify(historialMesaRepository, times(1)).save(any(HistorialMesa.class));
    }

    @Test
    void cambiarEstado_CuandoMesaNoExiste_DeberiaDevolverNotFound() {
        when(mesaRepository.findById(99)).thenReturn(Optional.empty());

        ResponseEntity<Mesa> respuesta = mesaController.cambiarEstado(99, EstadoMesa.OCUPADA);

        assertEquals(HttpStatus.NOT_FOUND, respuesta.getStatusCode());
        verify(historialMesaRepository, never()).save(any(HistorialMesa.class));
    }

    @Test
    void crearMesa_DeberiaGuardarYDevolverMesa() {
        Mesa nuevaMesa = new Mesa();
        nuevaMesa.setNumeroMesa(5);
        
        Mesa mesaGuardada = new Mesa();
        mesaGuardada.setIdMesa(1); 
        mesaGuardada.setNumeroMesa(5);
        
        when(mesaRepository.save(nuevaMesa)).thenReturn(mesaGuardada);

        Mesa resultado = mesaController.crearMesa(nuevaMesa);

        assertNotNull(resultado.getIdMesa());
        assertEquals(1, resultado.getIdMesa());
    }
}*/