// Country list for phone sign-up: ISO | name | dial code | min digits | max digits (national number, without the leading 0)
// Countries not listed with exact lengths use a safe 6-14 range.
const RAW = `BD|Bangladesh|880|10|10
IN|India|91|10|10
PK|Pakistan|92|10|10
LK|Sri Lanka|94|9|9
NP|Nepal|977|10|10
BT|Bhutan|975|8|8
MV|Maldives|960|7|7
AF|Afghanistan|93|9|9
MM|Myanmar|95|7|10
TH|Thailand|66|9|9
MY|Malaysia|60|9|10
SG|Singapore|65|8|8
ID|Indonesia|62|9|12
PH|Philippines|63|10|10
VN|Vietnam|84|9|10
KH|Cambodia|855|8|9
LA|Laos|856|9|10
CN|China|86|11|11
HK|Hong Kong|852|8|8
MO|Macao|853|8|8
TW|Taiwan|886|9|9
JP|Japan|81|10|10
KR|South Korea|82|9|10
MN|Mongolia|976|8|8
BN|Brunei|673|7|7
TL|Timor-Leste|670|8|8
KZ|Kazakhstan|7|10|10
UZ|Uzbekistan|998|9|9
KG|Kyrgyzstan|996|9|9
TJ|Tajikistan|992|9|9
TM|Turkmenistan|993|8|8
AZ|Azerbaijan|994|9|9
AM|Armenia|374|8|8
GE|Georgia|995|9|9
US|United States|1|10|10
CA|Canada|1|10|10
GB|United Kingdom|44|10|10
IE|Ireland|353|9|9
FR|France|33|9|9
DE|Germany|49|10|11
IT|Italy|39|9|10
ES|Spain|34|9|9
PT|Portugal|351|9|9
NL|Netherlands|31|9|9
BE|Belgium|32|9|9
LU|Luxembourg|352|8|9
CH|Switzerland|41|9|9
AT|Austria|43|10|11
SE|Sweden|46|9|9
NO|Norway|47|8|8
DK|Denmark|45|8|8
FI|Finland|358|9|10
IS|Iceland|354|7|7
PL|Poland|48|9|9
CZ|Czechia|420|9|9
SK|Slovakia|421|9|9
HU|Hungary|36|9|9
RO|Romania|40|9|9
BG|Bulgaria|359|8|9
GR|Greece|30|10|10
CY|Cyprus|357|8|8
MT|Malta|356|8|8
HR|Croatia|385|8|9
SI|Slovenia|386|8|8
RS|Serbia|381|8|9
BA|Bosnia and Herzegovina|387|8|8
ME|Montenegro|382|8|8
MK|North Macedonia|389|8|8
AL|Albania|355|9|9
XK|Kosovo|383|8|9
EE|Estonia|372|7|8
LV|Latvia|371|8|8
LT|Lithuania|370|8|8
BY|Belarus|375|9|9
UA|Ukraine|380|9|9
MD|Moldova|373|8|8
RU|Russia|7|10|10
TR|Turkey|90|10|10
AE|United Arab Emirates|971|9|9
SA|Saudi Arabia|966|9|9
QA|Qatar|974|8|8
KW|Kuwait|965|8|8
BH|Bahrain|973|8|8
OM|Oman|968|8|8
YE|Yemen|967|9|9
JO|Jordan|962|9|9
LB|Lebanon|961|7|8
SY|Syria|963|9|9
IQ|Iraq|964|10|10
IR|Iran|98|10|10
IL|Israel|972|9|9
PS|Palestine|970|9|9
EG|Egypt|20|10|10
MA|Morocco|212|9|9
DZ|Algeria|213|9|9
TN|Tunisia|216|8|8
LY|Libya|218|9|9
SD|Sudan|249|9|9
SS|South Sudan|211|9|9
NG|Nigeria|234|10|10
GH|Ghana|233|9|9
CI|Côte d'Ivoire|225|10|10
SN|Senegal|221|9|9
ML|Mali|223|8|8
BF|Burkina Faso|226|8|8
NE|Niger|227|8|8
GN|Guinea|224|9|9
SL|Sierra Leone|232|8|8
LR|Liberia|231|7|9
GM|Gambia|220|7|7
TG|Togo|228|8|8
BJ|Benin|229|8|10
CM|Cameroon|237|9|9
TD|Chad|235|8|8
CF|Central African Republic|236|8|8
CG|Congo|242|9|9
CD|DR Congo|243|9|9
GA|Gabon|241|7|8
GQ|Equatorial Guinea|240|9|9
AO|Angola|244|9|9
ZM|Zambia|260|9|9
ZW|Zimbabwe|263|9|9
MW|Malawi|265|7|9
MZ|Mozambique|258|9|9
TZ|Tanzania|255|9|9
KE|Kenya|254|9|9
UG|Uganda|256|9|9
RW|Rwanda|250|9|9
BI|Burundi|257|8|8
ET|Ethiopia|251|9|9
ER|Eritrea|291|7|7
DJ|Djibouti|253|8|8
SO|Somalia|252|7|9
MG|Madagascar|261|9|9
MU|Mauritius|230|8|8
SC|Seychelles|248|7|7
NA|Namibia|264|8|9
BW|Botswana|267|7|8
ZA|South Africa|27|9|9
LS|Lesotho|266|8|8
SZ|Eswatini|268|8|8
CV|Cabo Verde|238|7|7
MR|Mauritania|222|8|8
AU|Australia|61|9|9
NZ|New Zealand|64|8|10
FJ|Fiji|679|7|7
PG|Papua New Guinea|675|8|8
WS|Samoa|685|5|7
TO|Tonga|676|5|7
BR|Brazil|55|10|11
MX|Mexico|52|10|10
AR|Argentina|54|10|11
CO|Colombia|57|10|10
CL|Chile|56|9|9
PE|Peru|51|9|9
VE|Venezuela|58|10|10
EC|Ecuador|593|9|9
BO|Bolivia|591|8|8
PY|Paraguay|595|9|9
UY|Uruguay|598|8|9
GY|Guyana|592|7|7
SR|Suriname|597|6|7
CR|Costa Rica|506|8|8
PA|Panama|507|7|8
GT|Guatemala|502|8|8
HN|Honduras|504|8|8
SV|El Salvador|503|8|8
NI|Nicaragua|505|8|8
CU|Cuba|53|8|8
DO|Dominican Republic|1|10|10
JM|Jamaica|1|10|10
TT|Trinidad and Tobago|1|10|10
BS|Bahamas|1|10|10
BB|Barbados|1|10|10
HT|Haiti|509|8|8
PR|Puerto Rico|1|10|10
AD|Andorra|376|6|9
MC|Monaco|377|8|9
SM|San Marino|378|6|10
LI|Liechtenstein|423|7|9
VA|Vatican City|379|6|10
GL|Greenland|299|6|6
FO|Faroe Islands|298|6|6
NC|New Caledonia|687|6|6
PF|French Polynesia|689|8|8
GU|Guam|1|10|10
KY|Cayman Islands|1|10|10
BM|Bermuda|1|10|10`

export const COUNTRIES = RAW.split('\n').map(l => {
  const [iso, name, dial, min, max] = l.split('|')
  return { iso, name, dial, min: +min, max: +max }
})

export function flagOf(iso) {
  return String.fromCodePoint(...[...iso.toUpperCase()].map(c => 127397 + c.charCodeAt(0)))
}

export function findCountry(iso) {
  return COUNTRIES.find(c => c.iso === iso) || COUNTRIES[0]
}

// digits typed by the person -> national number without the leading 0
export function nationalDigits(input) {
  return String(input || '').replace(/\D/g, '').replace(/^0+/, '')
}

// returns '' when valid, otherwise a short message
export function validatePhone(country, input) {
  const n = nationalDigits(input)
  if (!n) return 'Enter your mobile number.'
  if (country.iso === 'BD') {
    return /^1[3-9]\d{8}$/.test(n) ? '' : 'Enter a valid Bangladesh mobile number (e.g. 01712345678).'
  }
  if (country.iso === 'IN' && !/^[6-9]/.test(n)) return 'Enter a valid Indian mobile number.'
  if (n.length < country.min || n.length > country.max) {
    return country.min === country.max
      ? `${country.name} numbers have ${country.min} digits.`
      : `${country.name} numbers have ${country.min}-${country.max} digits.`
  }
  return ''
}

export function phoneDigits(country, input) {
  return country.dial + nationalDigits(input)
}

// the hidden login id used for number accounts (never shown, never emailed)
export function phoneEmail(country, input) {
  return `p${phoneDigits(country, input)}@phone.heaven-bd.vercel.app`
}

export const PHONE_EMAIL_SUFFIX = '@phone.heaven-bd.vercel.app'
