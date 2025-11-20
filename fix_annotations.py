import sys
import pikepdf
import os

def fix_link_annotations(input_pdf, output_pdf):
    with pikepdf.open(input_pdf) as pdf:
        for page in pdf.pages:
            if "/Annots" not in page:
                continue

            for annot in page.Annots:
                subtype = annot.get("/Subtype", None)
                if subtype == "/Link":
                    if "/Contents" not in annot or not annot["/Contents"]:
                        annot["/Contents"] = pikepdf.String("Odnośnik w dokumencie")

        pdf.save(output_pdf)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python fix_annotations.py <input_pdf> <output_pdf>")
        sys.exit(1)

    input_pdf = os.path.abspath(sys.argv[1])
    output_pdf = os.path.abspath(sys.argv[2])

    fix_link_annotations(input_pdf, output_pdf)
