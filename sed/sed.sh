sed -i '/^\(O\*N\|[[:space:]]\)/! s/[1-9]/000&/' temp.txt

sed -i 's/\.//g' temp.txt

sed -i '/^\(O\*N\|[[:space:]]\)/!  /^[1-9][[:space:]][1-9]/ s/[1-9][[:space:]][1-9]/000&/' temp.txt

sed -i 's/\([0-9-]\) \+\([0-9-]\)/\1\2/g' temp.txt

sed -i 's/\([0-9]\) \{1\}\([0-9]\)/\10\2/g' temp.txt

sed -i 's/\([0-9]\) \{2\}\([0-9]\)/\100\2/g' temp.txt

sed -i 's/./X/1' temp.txt

# do not run on lines with "O*N", delete index 595, delete index 596, add "00" before index 592
sed -i '/^\(O\*N\)/! s|.||595; s|.||596; s|\(.\)|00\1|592;' temp.txt