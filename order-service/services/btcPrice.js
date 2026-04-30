const getBtcPrice = async () => {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur'
  );
  const data = await response.json();
  return data.bitcoin.eur;
};

module.exports = { getBtcPrice };