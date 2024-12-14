export class AddressUtils {
  public static ipToInt(ip: string): number {
    return ip.split('.').reduce((int, octet) => (int << 8) + parseInt(octet, 10), 0);
  };

  public static isIpInCidr(ipAddress: string, cidr: string) {
    const [cidrBase, prefixLength] = cidr.split('/');
    const mask = ~((1 << (32 - parseInt(prefixLength, 10))) - 1);
    const ipInt = this.ipToInt(ipAddress);
    const cidrBaseInt = this.ipToInt(cidrBase);

    return (ipInt & mask) === (cidrBaseInt & mask);
  };
};
