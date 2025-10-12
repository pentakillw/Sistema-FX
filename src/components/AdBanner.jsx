import React, { useEffect } from 'react';

const AdBanner = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.dataset.cfasync = "false";
    script.src = "//pl27818253.effectivegatecpm.com/b1bcdef33e26ff258cea985fafbdf8da/invoke.js";
    
    const container = document.getElementById('container-b1bcdef33e26ff258cea985fafbdf8da');
    if (container && container.children.length === 0) {
      container.appendChild(script);
    }
  }, []);

  return (
    <div className="mb-8 flex justify-center items-center">
      <div id="container-b1bcdef33e26ff258cea985fafbdf8da"></div>
    </div>
  );
};

export default AdBanner;
