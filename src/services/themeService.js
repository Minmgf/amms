import { apiMain } from "@/lib/axios";

class ThemeApiService {

  // Obtener todos los temas activos
  async getAllThemes() {
    try {
      const response = await apiMain.get('/visual_parameterization/list/');
      // Filtrar solo los activos
      return response.data.filter(theme => theme.visual_parameterization_status === 1);
    } catch (error) {
      console.error('Error obteniendo temas:', error);
      throw error;
    }
  }

  // Obtener un tema por ID
  async getThemeById(id) {
    try {
      const response = await apiMain.get(`/visual_parameterization/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo tema ${id}:`, error);
      throw error;
    }
  }

  // Crear un nuevo tema
  async createTheme(themeData) {
    try {
      const response = await apiMain.post('/visual_parameterization/', themeData);
      return response.data;
    } catch (error) {
      console.error('Error creando tema:', error);
      throw error;
    }
  }

  // Actualizar un tema existente
  async updateTheme(id, themeData) {
    try {
      const response = await apiMain.put(`/visual_parameterization/${id}/`, themeData);
      return response.data;
    } catch (error) {
      console.error(`Error actualizando tema ${id}:`, error);
      throw error;
    }
  }

  // Convertir tema de API al formato interno
  mapApiThemeToInternal(apiTheme) {
    return {
      id: apiTheme.id_visual_parameterization,
      name: apiTheme.name,
      description: apiTheme.description,
      colors: {
        primary: apiTheme.primary_color,
        secondary: apiTheme.secondary_color,
        accent: apiTheme.accent_color,
        background: apiTheme.background_color,
        surface: apiTheme.surface_color,
        text: apiTheme.text_color,
        textSecondary: apiTheme.text_secondary_color,
        border: apiTheme.border_color,
        hover: apiTheme.hover_color,
        error: apiTheme.error_color,
        success: apiTheme.success_color,
        warning: apiTheme.warning_color,
      },
      typography: {
        fontFamily: this.mapFontToFontFamily(apiTheme.font),
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: this.mapSizeToRem(apiTheme.paragraph_size),
          lg: '1.125rem',
          xl: this.mapSizeToRem(apiTheme.title_size),
          '2xl': '1.5rem',
          '3xl': '1.875rem',
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
        }
      },
      // Parámetros estáticos que no maneja la API
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      }
    };
  }

  // Convertir tema interno al formato de API
  mapInternalThemeToApi(internalTheme, responsibleUser = 1) {
    return {
      name: internalTheme.name,
      description: internalTheme.description || `Tema ${internalTheme.name}`,
      primary_color: internalTheme.colors.primary,
      secondary_color: internalTheme.colors.secondary,
      accent_color: internalTheme.colors.accent,
      background_color: internalTheme.colors.background,
      surface_color: internalTheme.colors.surface,
      text_color: internalTheme.colors.text,
      text_secondary_color: internalTheme.colors.textSecondary,
      border_color: internalTheme.colors.border,
      hover_color: internalTheme.colors.hover,
      error_color: internalTheme.colors.error,
      success_color: internalTheme.colors.success,
      warning_color: internalTheme.colors.warning,
      font: this.mapFontFamilyToFont(internalTheme.typography.fontFamily),
      title_size: this.mapRemToSize(internalTheme.typography.fontSize.xl),
      paragraph_size: this.mapRemToSize(internalTheme.typography.fontSize.base),
      responsible_user: responsibleUser
    };
  }

  // Mapear fuentes de la API a font-family CSS
  mapFontToFontFamily(font) {
    const fontMap = {
      'Inter': 'Inter, system-ui, -apple-system, sans-serif',
      'Poppins': 'Poppins, system-ui, sans-serif',
      'Roboto': 'Roboto, system-ui, sans-serif',
      'Arial': 'Arial, sans-serif',
      'Helvetica': 'Helvetica, sans-serif',
      'Georgia': 'Georgia, serif',
      'Times New Roman': 'Times New Roman, serif',
      'Verdana': 'Verdana, sans-serif',
    };
    
    return fontMap[font] || 'Inter, system-ui, -apple-system, sans-serif';
  }

  // Mapear font-family CSS a fuentes de la API
  mapFontFamilyToFont(fontFamily) {
    if (fontFamily.includes('Poppins')) return 'Poppins';
    if (fontFamily.includes('Roboto')) return 'Roboto';
    if (fontFamily.includes('Arial')) return 'Arial';
    if (fontFamily.includes('Helvetica')) return 'Helvetica';
    if (fontFamily.includes('Georgia')) return 'Georgia';
    if (fontFamily.includes('Times New Roman')) return 'Times New Roman';
    if (fontFamily.includes('Verdana')) return 'Verdana';
    return 'Inter';
  }

  // Mapear tamaños de la API a rem
  mapSizeToRem(size) {
    const sizeMap = {
      'xs': '0.75rem',
      'sm': '0.875rem',
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    };
    
    return sizeMap[size] || '1rem';
  }

  // Mapear rem a tamaños de la API
  mapRemToSize(rem) {
    const remMap = {
      '0.75rem': 'xs',
      '0.875rem': 'sm',
      '1rem': 'base',
      '1.125rem': 'lg',
      '1.25rem': 'xl',
      '1.5rem': '2xl',
      '1.875rem': '3xl',
    };
    
    return remMap[rem] || 'base';
  }
}

export default new ThemeApiService();