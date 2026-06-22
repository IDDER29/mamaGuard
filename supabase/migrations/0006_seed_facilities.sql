-- Migration 0006 — seed a starter facility directory (Plan 4.4).
-- Idempotent: only seeds when the table is empty, so re-runs are safe.

insert into facilities (name, type, region, city, phone)
select * from (values
  ('CHU Ibn Sina',                 'hospital',      'Rabat-Salé-Kénitra',        'Rabat',       '+212537000000'),
  ('Maternité Les Orangers',       'maternity',     'Rabat-Salé-Kénitra',        'Rabat',       '+212537000001'),
  ('CHU Ibn Rochd',                'hospital',      'Casablanca-Settat',         'Casablanca',  '+212522000000'),
  ('Hôpital Mohammed VI',          'hospital',      'Marrakech-Safi',            'Marrakech',   '+212524000000'),
  ('Centre de Santé Urbain Témara','health_center', 'Rabat-Salé-Kénitra',        'Témara',      '+212537000002'),
  ('Hôpital Hassan II',            'hospital',      'Fès-Meknès',                'Fès',         '+212535000000')
) as seed(name, type, region, city, phone)
where not exists (select 1 from facilities);
