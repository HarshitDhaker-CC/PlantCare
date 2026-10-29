from pathlib import Path

# Dataset location inside your project
DATASET_DIR = Path("dataset/plantvillage_dataset/color")

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def main():
    if not DATASET_DIR.exists():
        print("Dataset folder not found!")
        print("Expected location:", DATASET_DIR.resolve())
        print("\nPlease check your folder names.")
        return

    class_folders = sorted(
        folder for folder in DATASET_DIR.iterdir()
        if folder.is_dir()
    )

    total_images = 0

    print("\n========== DATASET REPORT ==========")
    print("Dataset path:", DATASET_DIR.resolve())
    print("Number of classes:", len(class_folders))
    print("\nImages per class:\n")

    for folder in class_folders:
        count = sum(
            1
            for file in folder.rglob("*")
            if file.is_file()
            and file.suffix.lower() in IMAGE_EXTENSIONS
        )

        total_images += count
        print(f"{folder.name}: {count} images")

    print("\n====================================")
    print("Total classes:", len(class_folders))
    print("Total images:", total_images)


if __name__ == "__main__":
    main()
