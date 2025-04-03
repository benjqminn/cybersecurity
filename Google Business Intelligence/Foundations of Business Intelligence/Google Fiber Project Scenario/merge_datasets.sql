SELECT
  date_created,
  contacts_n,
  contacts_n_1,
  contacts_n_2,
  contacts_n_3,
  contacts_n_4,
  contacts_n_5,
  contacts_n_6,
  contacts_n_7,
  new_type,
  new_market
FROM `your project.fiber.market_1`
UNION ALL
SELECT
  date_created,
  contacts_n,
  contacts_n_1,
  contacts_n_2,
  contacts_n_3,
  contacts_n_4,
  contacts_n_5,
  contacts_n_6,
  contacts_n_7,
  new_type,
  new_market
FROM `your project.fiber.market_2`
UNION ALL
SELECT
  date_created,
  contacts_n,
  contacts_n_1,
  contacts_n_2,
  contacts_n_3,
  contacts_n_4,
  contacts_n_5,
  contacts_n_6,
  contacts_n_7,
  new_type,
  new_market
FROM `your project.market_3`