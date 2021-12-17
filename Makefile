
project_folder = $(shell basename $(shell pwd))

base_metadata_json = metadata.json
generated_metadata_folder = com.github.leoheck.kiri

pack: $(project_folder).tar.gz
	@ make $(project_folder).tar.gz
	@ make metadata

$(project_folder).tar.gz:
	tar --exclude=$(project_folder).tar.gz -cvzf $(project_folder).tar.gz ../$(project_folder)

metadata: $(pcm_metadata_json) $(project_folder).tar.gz
	@ mkdir -p $(generated_metadata_folder)
	@ cp -f assets/kiri.png $(generated_metadata_folder)/icon.png
	@ cp -f ${base_metadata_json} $(generated_metadata_folder)/metadata.json
	@ jq ".versions[0].download_sha256 = \"$$(sha256sum $(project_folder).tar.gz | cut -d" " -f1)\"" $(generated_metadata_folder)/metadata.json > /tmp/tmp.json
	@ jq ".versions[0].download_size = $$(du -sb $(project_folder).tar.gz | cut -f1)" /tmp/tmp1.json > /tmp/tmp2.json
	@ jq ".versions[0].install_size = $$(du -sb ../$(project_folder) | cut -f1)" /tmp/tmp.json > /tmp/tmp1.json
	@ cp -f /tmp/tmp2.json $(generated_metadata_folder)/metadata.json
	make show

show:
	jq -C . $(generated_metadata_folder)/metadata.json


clean:
	rm -rf $(project_folder).tar.gz
	rm -rf $(generated_metadata_folder)


# zip_size=$(du -sb $(project_folder).tar.gz | cut -d $'\t' -f1)
# install_size=$(du -sb ../$(project_folder) | cut -d $'\t' -f1)

# download_sha256": "YOUR_SHA256_HERE",
# download_size": 1234,
# download_url": "https://github.com/YOUR/DOWNLOAD/URL/kicad-beautiful-theme.zip",
# install_size": 5678
