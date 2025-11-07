import React, { useEffect, useRef } from 'react';

/**
 * Componente para mostrar un banner de Google AdSense.
 * Maneja la carga de anuncios en una Single Page Application (SPA) como React.
 */
const GoogleAdBanner = ({
  className = '',
  style = { display: 'block' },
  dataAdSlot, // El ID de Slot (ej: "1234567890")
  dataAdFormat = 'auto',
  dataAdLayoutKey = '', // Para formatos especiales como "fluid"
  dataFullWidthResponsive = true,
}) => {
  const adRef = useRef(null);

  // Leemos el Client ID de publicador desde el archivo .env de Vite
  const dataAdClient = import.meta.env.VITE_GOOGLE_AD_CLIENT;

  useEffect(() => {
    // No ejecutar si falta información esencial
    if (!dataAdSlot) {
      console.error("GoogleAdBanner: Falta la prop 'dataAdSlot'. No se mostrará el anuncio.");
      return;
    }
    if (!dataAdClient) {
      console.error("GoogleAdBanner: Falta 'VITE_GOOGLE_AD_CLIENT' en el archivo .env.");
      return;
    }

    try {
      // Intenta "empujar" el anuncio.
      // Esto le dice a AdSense que muestre un anuncio en este slot.
      // Es necesario en SPAs (Single Page Applications) como React.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("Error al 'empujar' el anuncio de Google:", err);
    }
    
    // --- ¡CORRECCIÓN! ---
    // Hemos cambiado el array de dependencias a uno vacío: [].
    // Esto asegura que el script de anuncios se ejecute SÓLO UNA VEZ
    // cuando el componente se monta por primera vez, evitando el
    // error de "anuncios duplicados" en los re-renders.
  }, []); 

  // Si no hay ID de slot, no renderizar nada para evitar errores de AdSense
  if (!dataAdSlot) {
    return (
      <div className="text-center text-xs text-red-500">
        Error: Falta data-ad-slot para este anuncio.
      </div>
    );
  }

  return (
    // Contenedor del anuncio. 'text-center' ayuda con algunos formatos.
    <div className={`google-ad-banner text-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client={dataAdClient}
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        {...(dataAdLayoutKey && { 'data-ad-layout-key': dataAdLayoutKey })}
        data-full-width-responsive={dataFullWidthResponsive.toString()}
      ></ins>
    </div>
  );
};

export default GoogleAdBanner;