from inference_sdk import InferenceHTTPClient
import base64
from PIL import Image
import io

# 1. Connect ke Roboflow
client = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key="atskCHUBF2ID0riGFZqk"  # ⚠️ ganti kalau perlu
)

# 2. Jalankan workflow
result = client.run_workflow(
    workspace_name="liyang-s65dy",
    workflow_id="apelmatang",
    images={
        "image": "banyakapel.jpeg"
    },
    use_cache=True
)

# 3. Ambil hasil
if isinstance(result, list) and len(result) > 0:
    result = result[0]

print("\n=== HASIL DETEKSI ===")

# 4. Tampilkan jumlah objek
count = result.get("count_objects", 0)
print(f"Jumlah apel terdeteksi: {count}")

# 5. Tampilkan gambar hasil (popup)
output_image = result.get("output_image")

if output_image:
    try:
        image_bytes = base64.b64decode(output_image)
        image = Image.open(io.BytesIO(image_bytes))

        print("Menampilkan hasil gambar...")
        image.show()  # 🔥 POPUP muncul di sini

    except Exception as e:
        print("Gagal menampilkan gambar:", e)
else:
    print("Tidak ada output_image dari workflow")

print("\n=== SELESAI ===")