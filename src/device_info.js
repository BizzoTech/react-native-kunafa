import DeviceInfo from 'react-native-device-info';
import Config from 'react-native-config';

export default {
 device_unique_id: DeviceInfo.getUniqueID(),
 manufacturer: DeviceInfo.getManufacturer(),
 brand: DeviceInfo.getBrand(),
 model: DeviceInfo.getModel(),
 device_id: DeviceInfo.getDeviceId(),
 sys_name: DeviceInfo.getSystemName(),
 sys_version: DeviceInfo.getSystemVersion(),
 bundle_id: DeviceInfo.getBundleId(),
 build_number: DeviceInfo.getBuildNumber(),
 app_version: DeviceInfo.getVersion(),
 app_readable_version: DeviceInfo.getReadableVersion(),
 //device_name: DeviceInfo.getDeviceName(),
 user_agent: DeviceInfo.getUserAgent(),
 locale: DeviceInfo.getDeviceLocale(),
 country: DeviceInfo.getDeviceCountry(),
 timezone: DeviceInfo.getTimezone(),
 emulator: DeviceInfo.isEmulator(),
 build_type: Config.BUILD_TYPE
}
