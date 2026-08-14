-- ════════════════════════════════════════════════════════════════
--  LA CASA DEL EIFS · Datos de ejemplo (opcional)
--  Ejecútalo DESPUÉS de schema.sql para poblar el catálogo.
-- ════════════════════════════════════════════════════════════════

-- ── Categorías ──────────────────────────────────────────────────
insert into public.categories (name, slug, description) values
  ('Molduras y Cornisas', 'molduras-cornisas', 'Perfiles decorativos de EPS revestidos para enmarcar y realzar fachadas.'),
  ('Marcos y Jambas', 'marcos-jambas', 'Marcos para ventanas y puertas que aportan relieve y estilo.'),
  ('Adhesivos y Bases', 'adhesivos-bases', 'Morteros adhesivos y base coat para instalación y revoque.'),
  ('Mallas y Refuerzos', 'mallas-refuerzos', 'Mallas de fibra de vidrio y perfiles de refuerzo.'),
  ('Acabados y Texturas', 'acabados-texturas', 'Revestimientos texturados y de terminación para exteriores.'),
  ('Paneles EPS', 'paneles-eps', 'Placas de poliestireno expandido para aislación de fachadas.')
on conflict (slug) do nothing;

-- ── Productos ───────────────────────────────────────────────────
insert into public.products (name, slug, description, category_id, price, sku, dimensions, featured, stock, active)
select v.name, v.slug, v.description,
       (select id from public.categories where slug = v.cat),
       v.price, v.sku, v.dimensions, v.featured, v.stock, true
from (values
  ('Moldura Cornisa Clásica CE-100','moldura-cornisa-clasica-ce-100','Cornisa decorativa de EPS de alta densidad con revestimiento de base coat y malla. Ideal para remate superior de fachada. Largo 2 m.','molduras-cornisas',12990,'CE-100','100 x 80 mm · 2 m',true,120),
  ('Moldura Banda Lisa BL-60','moldura-banda-lisa-bl-60','Banda lisa para dividir paños y crear líneas horizontales. EPS revestido, lista para terminar. Largo 2 m.','molduras-cornisas',7990,'BL-60','60 x 40 mm · 2 m',true,200),
  ('Marco de Ventana MV-120','marco-ventana-mv-120','Perfil para enmarcar ventanas con relieve arquitectónico. Resistente a la intemperie. Largo 2 m.','marcos-jambas',10490,'MV-120','120 x 50 mm · 2 m',true,90),
  ('Jamba Recta JR-90','jamba-recta-jr-90','Jamba recta para vanos de puertas y ventanas. Fácil instalación con adhesivo EIFS.','marcos-jambas',8490,'JR-90','90 x 45 mm · 2 m',false,75),
  ('Adhesivo Base Coat AB-25','adhesivo-base-coat-ab-25','Mortero adhesivo y de revoque base para sistemas EIFS. Saco de 25 kg. Alta adherencia sobre EPS.','adhesivos-bases',15990,'AB-25','Saco 25 kg',true,300),
  ('Adhesivo Pegado EPS AP-25','adhesivo-pegado-eps-ap-25','Adhesivo específico para pegado de placas de poliestireno al muro. Saco de 25 kg.','adhesivos-bases',14490,'AP-25','Saco 25 kg',false,260),
  ('Malla Fibra de Vidrio MF-160','malla-fibra-vidrio-mf-160','Malla de refuerzo de fibra de vidrio 160 g/m², resistente a álcalis. Rollo de 50 m².','mallas-refuerzos',34990,'MF-160','Rollo 1 x 50 m',true,60),
  ('Perfil Cantonera con Malla PC-10','perfil-cantonera-malla-pc-10','Perfil de PVC con malla para protección y refuerzo de aristas y esquinas. Largo 2,5 m.','mallas-refuerzos',3290,'PC-10','2,5 m',false,400),
  ('Revestimiento Texturado RT-15','revestimiento-texturado-rt-15','Acabado acrílico texturado grano medio para terminación de fachada. Balde 25 kg. Amplia gama de colores.','acabados-texturas',42990,'RT-15','Balde 25 kg',true,140),
  ('Acabado Liso Premium AL-20','acabado-liso-premium-al-20','Terminación acrílica de aspecto liso premium, alta resistencia UV. Balde 25 kg.','acabados-texturas',48990,'AL-20','Balde 25 kg',false,85),
  ('Panel EPS 30 mm PE-30','panel-eps-30mm-pe-30','Placa de poliestireno expandido de 30 mm para aislación térmica de fachada. 1,00 x 0,50 m.','paneles-eps',2490,'PE-30','1000 x 500 x 30 mm',false,500),
  ('Panel EPS 50 mm PE-50','panel-eps-50mm-pe-50','Placa de poliestireno expandido de 50 mm, mayor aislación térmica. 1,00 x 0,50 m.','paneles-eps',3690,'PE-50','1000 x 500 x 50 mm',true,480)
) as v(name, slug, description, cat, price, sku, dimensions, featured, stock)
on conflict (slug) do nothing;

-- ── Clientes (CRM) ──────────────────────────────────────────────
insert into public.customers (name, email, phone, company, city, status, notes) values
  ('Constructora Andes Ltda.','compras@andes.cl','+56 2 2345 6789','Constructora Andes','Santiago','activo','Cliente frecuente, proyectos residenciales.'),
  ('Arq. Valentina Rojas','vrojas@estudioroja.cl','+56 9 8765 4321','Estudio Rojas','Viña del Mar','activo','Especifica acabados texturados en sus obras.'),
  ('Ferretería El Maestro','ventas@elmaestro.cl','+56 41 223 1122','El Maestro SpA','Concepción','prospecto','Interesados en reventa de molduras.'),
  ('Inmobiliaria Costa Verde','proyectos@costaverde.cl','+56 2 2999 8877','Costa Verde','La Serena','inactivo','Proyecto en pausa.')
on conflict do nothing;

-- ════════════════════════════════════════════════════════════════
--  IMPORTANTE — Crear tu usuario administrador:
--  1) Regístrate en el sitio (/registro) o en Supabase > Authentication.
--  2) Copia tu UUID desde Authentication > Users.
--  3) Ejecuta (reemplaza el UUID):
--
--     update public.profiles set role = 'admin'
--     where id = '00000000-0000-0000-0000-000000000000';
-- ════════════════════════════════════════════════════════════════
