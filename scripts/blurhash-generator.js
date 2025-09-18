import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { encode } from 'blurhash';
import pLimit from 'p-limit';
import os from 'os';
import exifReader from 'exif-reader';

// 获取当前脚本目录（ESM 写法）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置项
const config = {
  rootDir: path.resolve(__dirname, '../photos'),
  outputDir: path.resolve(__dirname, '../public/photos'),
  cacheFile: path.resolve(__dirname, 'blurhash-cache.json'),
  outputFile: path.resolve(__dirname, '../public/photos.json'),
  concurrency: Number(process.env.CONCURRENCY) || Math.max(2, os.cpus().length - 1), // 转换为数字
  resizeWidth: 1920,
  quality: 90,
  supportedFormats: /\.(jpe?g|png|webp)$/i,
};

// 递归扫描目录获取所有图片绝对路径（异步）
async function walkDir(dir) {
  let results = [];
  try {
    const list = await fs.readdir(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        results = results.concat(await walkDir(filePath));
      } else if (config.supportedFormats.test(file)) {
        results.push(filePath);
      }
    }
  } catch (e) {
    console.error(`扫描目录 ${dir} 失败: ${e.message}`);
  }
  return results;
}

// 读缓存
async function readCache() {
  try {
    if (await fs.access(config.cacheFile).then(() => true).catch(() => false)) {
      const data = await fs.readFile(config.cacheFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn(`读取缓存文件失败: ${e.message}`);
  }
  return {};
}

// 写缓存
async function writeCache(cache) {
  try {
    await fs.writeFile(config.cacheFile, JSON.stringify(cache, null, 2));
    console.log('缓存文件写入成功');
  } catch (e) {
    console.error(`写入缓存文件失败: ${e.message}`);
  }
}

// 生成 BlurHash
async function getBlurHash(filePath) {
  try {
    const image = sharp(filePath);
    const { data, info } = await image
      .raw()
      .ensureAlpha()
      .resize(32, 32, { fit: 'inside' })
      .toBuffer({ resolveWithObject: true });

    return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
  } catch (e) {
    throw new Error(`生成 BlurHash 失败: ${e.message}`);
  }
}

// 读取 EXIF 信息和宽高
async function getImageMetadata(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    const exifData = metadata.exif ? exifReader(metadata.exif) : null;

    function gpsToDecimal(ref, [deg, min, sec]) {
      if (!ref || !deg) return null;
      const sign = (ref === 'S' || ref === 'W') ? -1 : 1;
      return sign * (deg + min / 60 + sec / 3600);
    }

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      exif: exifData
        ? {
            dateTime: exifData.Photo?.DateTimeOriginal || '',
            cameraModel: exifData.Image?.Model || '',
            gps: exifData.GPSInfo
              ? {
                  latitude: gpsToDecimal(exifData.GPSInfo.GPSLatitudeRef, exifData.GPSInfo.GPSLatitude),
                  longitude: gpsToDecimal(exifData.GPSInfo.GPSLongitudeRef, exifData.GPSInfo.GPSLongitude),
                }
              : null,
            focalLength: exifData.Photo?.FocalLength || '',
            iso: exifData.Photo?.ISOSpeedRatings || '',
          }
        : { dateTime: '', cameraModel: '', gps: null, focalLength: '', iso: '' },
    };
  } catch (e) {
    console.warn(`读取 ${filePath} 的元数据失败: ${e.message}`);
    return { width: 0, height: 0, exif: { dateTime: '', cameraModel: '', gps: null, focalLength: '', iso: '' } };
  }
}


// 压缩图片，写入 outputPath
async function compressImage(inputPath, outputPath) {
  try {
    const ext = path.extname(inputPath).toLowerCase();
    const sharpInstance = sharp(inputPath).resize({
      width: config.resizeWidth,
      withoutEnlargement: true,
    });

    if (ext === '.webp') {
      await sharpInstance.webp({ quality: config.quality }).toFile(outputPath);
    } else if (ext === '.png') {
      await sharpInstance.png({ quality: config.quality }).toFile(outputPath);
    } else {
      await sharpInstance.jpeg({ quality: config.quality }).toFile(outputPath);
    }
    console.log(`压缩图片成功: ${outputPath}`);
  } catch (e) {
    throw new Error(`压缩图片失败: ${e.message}`);
  }
}

// 简单判断是否需要版权
function determineCopyright(filePath) {
  if (filePath.includes('own-photos')) {
    return '© augustqin 2025';
  }
  return '';
}

// 检查文件是否可读
async function isFileReadable(filePath) {
  try {
    await fs.access(filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

// 处理单个文件
async function processFile(filePath, cache) {
  if (!(await isFileReadable(filePath))) {
    console.warn(`文件不可读: ${filePath}`);
    return null;
  }

  const stat = await fs.stat(filePath);
  const mtime = stat.mtimeMs;
  const relPath = path.relative(config.rootDir, filePath).replace(/\\/g, '/');
  const outputFile = path.join(config.outputDir, relPath);

  // 检查缓存
  if (
    cache[relPath] &&
    cache[relPath].mtime === mtime &&
    (await fs.access(outputFile).then(() => true).catch(() => false))
  ) {
    console.log(`缓存命中: ${relPath}`);
    return {
      url: `/photos/${relPath}`,
      blurHash: cache[relPath].blurHash,
      copyright: cache[relPath].copyright || '',
      width: cache[relPath].width || 0,
      height: cache[relPath].height || 0,
      compressedWidth: cache[relPath].compressedWidth || 0,
      compressedHeight: cache[relPath].compressedHeight || 0,
      exif: cache[relPath].exif || { dateTime: '', cameraModel: '', gps: null },//加了exif其他，之后更新，今天来不及了
    };
  }

  try {
    // 确保输出目录存在
    await fs.mkdir(path.dirname(outputFile), { recursive: true });
    console.log(`处理: ${relPath}`);

    // 生成 BlurHash、压缩图片、读取元数据
    const blurHash = await getBlurHash(filePath);
    await compressImage(filePath, outputFile);
    const copyright = determineCopyright(filePath);
    const { width, height, exif } = await getImageMetadata(filePath);

    // 添加压缩后宽高
    const compressedMetadata = await sharp(outputFile).metadata(); // 添加在这里
    const compressedWidth = compressedMetadata.width || 0;
    const compressedHeight = compressedMetadata.height || 0;

    // 更新缓存
    cache[relPath] = {
      mtime, blurHash, copyright, width, height, exif, compressedWidth,
      compressedHeight
    };
    await writeCache(cache);

    return {
      url: `/photos/${relPath}`,
      blurHash,
      copyright,
      width,
      height,
      exif,
      compressedWidth, // 添加压缩后宽高
      compressedHeight,
    };
  } catch (e) {
    console.error(`处理 ${relPath} 失败: ${e.message}`);
    return null;
  }
}

// 验证输出文件
async function validateOutput(results) {
  try {
    const outputFiles = await walkDir(config.outputDir);
    const resultCount = results.filter(Boolean).length;
    if (outputFiles.length !== resultCount) {
      console.warn(
        `输出文件数量 (${outputFiles.length}) 与结果数量 (${resultCount}) 不匹配`
      );
    } else {
      console.log('输出文件验证通过');
    }
  } catch (e) {
    console.error(`验证输出文件失败: ${e.message}`);
  }
}

async function cleanOutputDir() {
  try {
    await fs.rm(config.outputDir, { recursive: true, force: true });
    console.log(`清理输出目录: ${config.outputDir}`);
  } catch (e) {
    console.error(`清理输出目录失败: ${e.message}`);
  }
}
// 主函数
async function main() {
  // 顶部解析 argv
  const argv = process.argv.slice(2);
  const shouldClean = argv.includes('--clean');
  try {
    if (shouldClean) {
      await cleanOutputDir();          // 先删旧文件
    }
    console.log(`默认并发数: ${config.concurrency}`);
    const files = await walkDir(config.rootDir);
    if (files.length === 0) {
      console.warn('未找到支持的图片文件');
      return;
    }

    const cache = await readCache();
    const limit = pLimit(config.concurrency);

    const results = await Promise.all(
      files.map(filePath => limit(() => processFile(filePath, cache)))
    );

    // 过滤掉失败的结果并写入输出文件
    const validResults = results.filter(Boolean);
    await fs.writeFile(
      config.outputFile,
      JSON.stringify(validResults, null, 2)
    );
    console.log(`生成 ${config.outputFile}，共 ${validResults.length} 条记录`);

    // 验证输出
    await validateOutput(validResults);
  } catch (e) {
    console.error(`脚本执行失败: ${e.message}`);
    process.exit(1);
  }
}

main();
