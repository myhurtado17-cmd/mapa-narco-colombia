// Módulo principal de la aplicación
const App = (function () {
  // Variables globales
  let map;
  let markers = [];
  let routeLines = [];
  let heatLayers = {
    coca: null,
    marihuana: null,
    violence: null,
    labs: null
  };
  let markerCluster;

  // Inicialización de la aplicación
  function init() {
    initMap();
    initControls();
    initSearch();
    initExport();
    initComparison();
    initHeatmapSlider();

    // Ocultar indicador de carga
    setTimeout(() => {
      document.getElementById('loadingOverlay').style.opacity = '0';
      setTimeout(() => {
        document.getElementById('loadingOverlay').style.display = 'none';
      }, 500);
    }, 1500);
  }

  // Inicializar el mapa
  function initMap() {
    map = L.map('map').setView([4.5, -74.1], 6);

    // Añadir capa base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      className: 'colombia-highlight'
    }).addTo(map);

    // Inicializar clustering de marcadores
    markerCluster = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50
    });
    map.addLayer(markerCluster);

    // Crear visualizaciones iniciales
    createMarkers();
    drawRoutes();

    // Calcular estadísticas iniciales
    updateStatistics();
  }

  // Inicializar controles
  function initControls() {
    // Event listeners para controles de visualización
    document.getElementById('show-coca').addEventListener('change', updateVisualizations);
    document.getElementById('show-marihuana').addEventListener('change', updateVisualizations);
    document.getElementById('show-routes').addEventListener('change', updateVisualizations);
    document.getElementById('show-violence').addEventListener('change', updateVisualizations);
    document.getElementById('show-ports').addEventListener('change', updateVisualizations);

    // Event listeners para filtros avanzados
    document.getElementById('filter-violence-high').addEventListener('change', applyFilters);
    document.getElementById('filter-hectares-large').addEventListener('change', applyFilters);
    document.getElementById('filter-labs-multiple').addEventListener('change', applyFilters);

    // Event listeners para mapas de calor
    document.querySelectorAll('.heatmap-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', updateHeatmaps);
    });
    document.getElementById('heatmap-intensity').addEventListener('input', updateHeatmaps);

    // Event listeners para controles de capa
    document.querySelectorAll('.layer-btn').forEach(btn => {
      if (btn.id !== 'compare-btn') {
        btn.addEventListener('click', handleLayerControl);
      }
    });

    // Event listener para botón de comparación
    document.getElementById('compare-btn').addEventListener('click', showComparisonPanel);
    // Event listener para modo oscuro
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

    loadThemePreference();
  }

  function toggleDarkMode() {
    const body = document.body;
    const toggleBtn = document.getElementById('darkModeToggle');
    const icon = toggleBtn.querySelector('i');

    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
      icon.className = 'fas fa-sun';
      toggleBtn.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
      localStorage.setItem('darkMode', 'enabled');
    } else {
      icon.className = 'fas fa-moon';
      toggleBtn.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
      localStorage.setItem('darkMode', 'disabled');
    }
  }

  // Función para cargar preferencia guardada
  function loadThemePreference() {
    const darkMode = localStorage.getItem('darkMode');
    const toggleBtn = document.getElementById('darkModeToggle');

    if (darkMode === 'enabled') {
      document.body.classList.add('dark-mode');
      toggleBtn.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
    }
  }

  // Función para ajustar alturas dinámicamente
  function adjustHeights() {
    const windowHeight = window.innerHeight;
    const headerHeight = document.querySelector('header').offsetHeight;
    const controlsHeight = document.querySelector('.controls-panel').offsetHeight;

    // Calcular altura óptima para el mapa
    const optimalMapHeight = windowHeight - headerHeight - 200;
    const mapWrapper = document.querySelector('.map-wrapper');

    if (optimalMapHeight > 400) {
      mapWrapper.style.height = optimalMapHeight + 'px';
    }
  }

  // Ejecutar al cargar y al redimensionar
  window.addEventListener('load', adjustHeights);
  window.addEventListener('resize', adjustHeights);

  function initHeatmapSlider() {
    const slider = document.getElementById('heatmap-intensity');
    const valueDisplay = document.createElement('div');
    valueDisplay.className = 'heatmap-value';
    valueDisplay.textContent = `Intensidad: ${slider.value}`;

    slider.parentNode.appendChild(valueDisplay);

    slider.addEventListener('input', function () {
      valueDisplay.textContent = `Intensidad: ${this.value}`;
      updateHeatmaps();
    });
  }

  // Inicializar funcionalidad de búsqueda
  function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    searchInput.addEventListener('input', function () {
      const query = this.value.toLowerCase().trim();
      searchResults.innerHTML = '';

      if (query.length < 2) return;

      const results = locations.filter(location =>
        location.municipio.toLowerCase().includes(query) ||
        location.departamento.toLowerCase().includes(query)
      );

      results.forEach(location => {
        const li = document.createElement('li');
        li.className = 'search-result-item';
        li.textContent = `${location.municipio}, ${location.departamento}`;
        li.addEventListener('click', () => {
          map.setView([location.lat, location.lng], 10);
          searchInput.value = '';
          searchResults.innerHTML = '';
        });
        searchResults.appendChild(li);
      });
    });
  }

  // Inicializar funcionalidad de exportación
  function initExport() {
    document.getElementById('exportPNG').addEventListener('click', exportMapAsPNG);
    document.getElementById('exportData').addEventListener('click', exportDataAsCSV);
  }

  // Inicializar funcionalidad de comparación
  function initComparison() {
    document.getElementById('closeComparison').addEventListener('click', () => {
      document.getElementById('comparisonPanel').style.display = 'none';
    });
  }

  // Función para exportar el mapa como PNG
  function exportMapAsPNG() {
    html2canvas(document.getElementById('map')).then(canvas => {
      const link = document.createElement('a');
      link.download = 'mapa-colombia-cultivos.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }

  // Función para exportar datos como CSV
  function exportDataAsCSV() {
    const headers = ['Departamento', 'Municipio', 'Tipo', 'Hectáreas', 'Violencia', 'Laboratorios', 'Grupos'];
    const csvContent = [
      headers.join(','),
      ...locations.map(l => [
        l.departamento,
        l.municipio,
        l.tipo,
        l.hectareas,
        l.violencia,
        l.laboratorios,
        l.grupos.join(';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'datos-cultivos-colombia.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  // Función para mostrar panel de comparación
  function showComparisonPanel() {
    const panel = document.getElementById('comparisonPanel');
    const content = document.getElementById('comparisonContent');

    // Agrupar por departamento
    const byDept = locations.reduce((acc, loc) => {
      if (!acc[loc.departamento]) {
        acc[loc.departamento] = {
          coca: 0,
          marihuana: 0,
          violencia: 0,
          laboratorios: 0
        };
      }

      if (loc.tipo === 'Coca') acc[loc.departamento].coca += loc.hectareas;
      if (loc.tipo === 'Marihuana') acc[loc.departamento].marihuana += loc.hectareas;
      acc[loc.departamento].violencia += loc.violencia;
      acc[loc.departamento].laboratorios += loc.laboratorios;

      return acc;
    }, {});

    // Ordenar por área total de cultivos
    const sortedDepts = Object.entries(byDept)
      .sort((a, b) => (b[1].coca + b[1].marihuana) - (a[1].coca + a[1].marihuana))
      .slice(0, 6); // Top 6 departamentos

    content.innerHTML = sortedDepts.map(([dept, data]) => `
            <div class="comparison-item">
                <h4>${dept}</h4>
                <p><strong>Coca:</strong> ${data.coca.toLocaleString()} ha</p>
                <p><strong>Marihuana:</strong> ${data.marihuana.toLocaleString()} ha</p>
                <p><strong>Violencia:</strong> ${data.violencia} incidentes</p>
                <p><strong>Laboratorios:</strong> ${data.laboratorios}</p>
            </div>
        `).join('');

    panel.style.display = 'block';
  }

  // Función para obtener color según el tipo
  function getColorByType(type) {
    switch (type) {
      case "Coca": return "#e74c3c";
      case "Marihuana": return "#27ae60";
      case "Ruta": return "#3498db";
      case "Violencia": return "#f39c12";
      case "Puerto": return "#9b59b6";
      default: return "#2ecc71";
    }
  }

  // Función para obtener ícono según el tipo (marcadores más grandes)
  function getIconByType(type, index) {
    const color = getColorByType(type);
    let iconClass = "fas fa-leaf";

    if (type === "Marihuana") {
      iconClass = "fas fa-cannabis";
    } else if (type === "Ruta") {
      iconClass = "fas fa-route";
    } else if (type === "Violencia") {
      iconClass = "fas fa-skull-crossbones";
    } else if (type === "Puerto") {
      iconClass = "fas fa-anchor";
    }

    return L.divIcon({
      className: 'animated-marker',
      html: `
                <div style="
                    background-color: ${color}; 
                    width: 28px; 
                    height: 28px; 
                    border-radius: 50%; 
                    border: 4px solid white; 
                    box-shadow: 0 0 15px rgba(0,0,0,0.6), 0 0 10px ${color};
                    animation: pulse 2s infinite;
                    animation-delay: ${index * 0.1}s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 14px;
                ">
                    <i class="${iconClass}"></i>
                </div>
            `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
  }

  // Función para crear marcadores con animaciones
  function createMarkers() {
    // Limpiar marcadores existentes
    markerCluster.clearLayers();
    markers = [];

    // Obtener configuraciones de visualización
    const showCoca = document.getElementById('show-coca').checked;
    const showMarihuana = document.getElementById('show-marihuana').checked;
    const showRoutes = document.getElementById('show-routes').checked;
    const showViolence = document.getElementById('show-violence').checked;
    const showPorts = document.getElementById('show-ports').checked;

    // Obtener configuraciones de filtros
    const filterViolenceHigh = document.getElementById('filter-violence-high').checked;
    const filterHectaresLarge = document.getElementById('filter-hectares-large').checked;
    const filterLabsMultiple = document.getElementById('filter-labs-multiple').checked;

    // Crear marcadores para cada ubicación
    locations.forEach((location, index) => {
      let shouldShow = false;

      if (location.tipo === "Coca" && showCoca) {
        shouldShow = true;
      } else if (location.tipo === "Marihuana" && showMarihuana) {
        shouldShow = true;
      } else if (location.tipo === "Ruta" && showRoutes) {
        shouldShow = true;
      } else if (location.tipo === "Violencia" && showViolence) {
        shouldShow = true;
      } else if (location.tipo === "Puerto" && showPorts) {
        shouldShow = true;
      }

      // Aplicar filtros avanzados
      if (filterViolenceHigh && location.violencia <= 150) {
        shouldShow = false;
      }
      if (filterHectaresLarge && location.hectareas <= 10000) {
        shouldShow = false;
      }
      if (filterLabsMultiple && location.laboratorios <= 3) {
        shouldShow = false;
      }

      if (shouldShow) {
        const icon = getIconByType(location.tipo, index);

        // Crear marcadores con animación de entrada
        const marker = L.marker([location.lat, location.lng], {
          icon: icon,
          opacity: 0 // Inicialmente invisible para animación
        });

        // Animación de entrada del marcador
        setTimeout(() => {
          marker.setOpacity(1);
        }, index * 100 + 500);

        // Añadir popup con información
        marker.bindPopup(`
                    <div style="color: #333; min-width: 280px;">
                        <h3 style="margin: 0 0 10px 0; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                            ${location.municipio}, ${location.departamento}
                        </h3>
                        <p style="margin: 5px 0;"><strong>Tipo:</strong> <span style="color: ${getColorByType(location.tipo)};">${location.tipo}</span></p>
                        <p style="margin: 5px 0;">${location.descripcion}</p>
                        ${location.tipo === "Coca" || location.tipo === "Marihuana" ?
            `<p style="margin: 5px 0;"><strong>Hectáreas (2023):</strong> ${location.hectareas.toLocaleString()}</p>` : ''}
                        <p style="margin: 5px 0;"><strong>Incidentes violentos (2023):</strong> ${location.violencia}</p>
                        ${location.laboratorios > 0 ?
            `<p style="margin: 5px 0;"><strong>Laboratorios identificados:</strong> ${location.laboratorios}</p>` : ''}
                        <p style="margin: 5px 0;"><strong>Grupos armados:</strong> ${location.grupos.join(", ")}</p>
                    </div>
                `);

        // Efecto hover para el marcador
        marker.on('mouseover', function () {
          this.setZIndexOffset(1000);
        });

        marker.on('mouseout', function () {
          this.setZIndexOffset(0);
        });

        markers.push(marker);
        markerCluster.addLayer(marker);
      }
    });
  }

  // Función para dibujar rutas con animación
  function drawRoutes() {
    // Limpiar rutas existentes
    routeLines.forEach(line => map.removeLayer(line));
    routeLines = [];

    // Verificar si se deben mostrar las rutas
    if (!document.getElementById('show-routes').checked) {
      return;
    }

    // Dibujar cada ruta con animación
    routes.forEach((route, index) => {
      const fromLocation = locations.find(loc => loc.id === route.from);
      const toLocation = locations.find(loc => loc.id === route.to);

      if (fromLocation && toLocation) {
        const color = getColorByType("Ruta");

        // Crear la ruta inicialmente invisible
        const line = L.polyline(
          [[fromLocation.lat, fromLocation.lng], [toLocation.lat, toLocation.lng]],
          {
            color: color,
            weight: 4,
            opacity: 0, // Inicialmente invisible
            dashArray: route.tipo === "Terrestre" ? null : '5, 10'
          }
        ).addTo(map);

        // Animación de la ruta
        setTimeout(() => {
          line.setStyle({ opacity: 0.7 });
        }, index * 200 + 1000);

        // Añadir popup a la ruta
        line.bindPopup(`
                    <div style="color: #333; min-width: 200px;">
                        <h4 style="margin: 0 0 8px 0; color: #2c3e50;">${route.descripcion}</h4>
                        <p style="margin: 5px 0;"><strong>Tipo:</strong> ${route.tipo}</p>
                        <p style="margin: 5px 0;"><strong>Origen:</strong> ${fromLocation.municipio}</p>
                        <p style="margin: 5px 0;"><strong>Destino:</strong> ${toLocation.municipio}</p>
                    </div>
                `);

        routeLines.push(line);
      }
    });
  }

  // Función para actualizar los mapas de calor
  function updateHeatmaps() {
    // Obtener intensidad del control deslizante
    const intensity = document.getElementById('heatmap-intensity').value / 5;

    // Eliminar capas de calor existentes
    Object.keys(heatLayers).forEach(key => {
      if (heatLayers[key]) {
        map.removeLayer(heatLayers[key]);
        heatLayers[key] = null;
      }
    });

    // Preparar datos para cada tipo de mapa de calor
    const heatData = {
      coca: [],
      marihuana: [],
      violence: [],
      labs: []
    };

    locations.forEach(location => {
      // Datos para mapa de calor de coca
      if (document.getElementById('heatmap-coca').checked && location.tipo === "Coca") {
        heatData.coca.push([location.lat, location.lng, location.hectareas / 1500 * intensity]);
      }

      // Datos para mapa de calor de marihuana
      if (document.getElementById('heatmap-marihuana').checked && location.tipo === "Marihuana") {
        heatData.marihuana.push([location.lat, location.lng, location.hectareas / 300 * intensity]);
      }

      // Datos para mapa de calor de violencia
      if (document.getElementById('heatmap-violence').checked) {
        heatData.violence.push([location.lat, location.lng, location.violencia / 15 * intensity]);
      }

      // Datos para mapa de calor de laboratorios
      if (document.getElementById('heatmap-labs').checked && location.laboratorios > 0) {
        heatData.labs.push([location.lat, location.lng, location.laboratorios * 2 * intensity]);
      }
    });

    // Crear capas de calor según lo seleccionado
    if (document.getElementById('heatmap-coca').checked && heatData.coca.length > 0) {
      heatLayers.coca = L.heatLayer(heatData.coca, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        gradient: {
          0.2: '#ffebee',
          0.4: '#ffcdd2',
          0.6: '#ef9a9a',
          0.8: '#e57373',
          1.0: '#e74c3c'
        }
      }).addTo(map);
    }

    if (document.getElementById('heatmap-marihuana').checked && heatData.marihuana.length > 0) {
      heatLayers.marihuana = L.heatLayer(heatData.marihuana, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        gradient: {
          0.2: '#e8f5e8',
          0.4: '#c8e6c9',
          0.6: '#a5d6a7',
          0.8: '#81c784',
          1.0: '#27ae60'
        }
      }).addTo(map);
    }

    if (document.getElementById('heatmap-violence').checked && heatData.violence.length > 0) {
      heatLayers.violence = L.heatLayer(heatData.violence, {
        radius: 25,
        blur: 15,
        maxZoom: 10,
        gradient: {
          0.2: '#fff3e0',
          0.4: '#ffe0b2',
          0.6: '#ffcc80',
          0.8: '#ffb74d',
          1.0: '#f39c12'
        }
      }).addTo(map);
    }

    if (document.getElementById('heatmap-labs').checked && heatData.labs.length > 0) {
      heatLayers.labs = L.heatLayer(heatData.labs, {
        radius: 20,
        blur: 10,
        maxZoom: 10,
        gradient: {
          0.2: '#f3e5f5',
          0.4: '#e1bee7',
          0.6: '#ce93d8',
          0.8: '#ba68c8',
          1.0: '#9b59b6'
        }
      }).addTo(map);
    }
  }

  // Función para actualizar todas las visualizaciones
  function updateVisualizations() {
    createMarkers();
    drawRoutes();
    updateHeatmaps();
    updateStatistics();
  }

  // Función para aplicar filtros avanzados
  function applyFilters() {
    createMarkers();
    updateStatistics();
  }

  // Función para manejar controles de capa
  function handleLayerControl() {
    const action = this.getAttribute('data-action');

    document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');

    switch (action) {
      case 'show-all':
        document.getElementById('show-coca').checked = true;
        document.getElementById('show-marihuana').checked = true;
        document.getElementById('show-routes').checked = true;
        document.getElementById('show-violence').checked = true;
        document.getElementById('show-ports').checked = true;
        break;
      case 'hide-all':
        document.getElementById('show-coca').checked = false;
        document.getElementById('show-marihuana').checked = false;
        document.getElementById('show-routes').checked = false;
        document.getElementById('show-violence').checked = false;
        document.getElementById('show-ports').checked = false;
        break;
      case 'reset-view':
        map.setView([4.5, -74.1], 6);
        return; // No actualizar visualizaciones
      case 'show-coca-only':
        document.getElementById('show-coca').checked = true;
        document.getElementById('show-marihuana').checked = false;
        document.getElementById('show-routes').checked = true;
        document.getElementById('show-violence').checked = true;
        document.getElementById('show-ports').checked = true;
        break;
      case 'show-marihuana-only':
        document.getElementById('show-coca').checked = false;
        document.getElementById('show-marihuana').checked = true;
        document.getElementById('show-routes').checked = true;
        document.getElementById('show-violence').checked = true;
        document.getElementById('show-ports').checked = true;
        break;
    }

    updateVisualizations();
  }

  // Función para actualizar estadísticas
  function updateStatistics() {
    const cocaLocations = locations.filter(loc => loc.tipo === "Coca");
    const marihuanaLocations = locations.filter(loc => loc.tipo === "Marihuana");

    const totalCoca = cocaLocations.reduce((sum, loc) => sum + loc.hectareas, 0);
    const totalMarihuana = marihuanaLocations.reduce((sum, loc) => sum + loc.hectareas, 0);
    const totalIncidents = locations.reduce((sum, loc) => sum + loc.violencia, 0);

    document.getElementById('total-coca').textContent = totalCoca.toLocaleString();
    document.getElementById('total-marihuana').textContent = totalMarihuana.toLocaleString();
    document.getElementById('total-incidents').textContent = totalIncidents.toLocaleString();
    document.getElementById('total-routes').textContent = routes.length;
    document.getElementById('total-locations').textContent = locations.length;
  }

  return {
    init: init
  };
})();

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', App.init);