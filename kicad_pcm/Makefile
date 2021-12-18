
project_name = kiri
project_folder = "kicad_plugin_v6"

base_metadata_json = metadata.json
generated_metadata_folder = com.github.leoheck.kiri

pack: $(project_name).tar.gz
	@ make -s $(project_name).tar.gz
	@ make -s metadata

$(project_name).tar.gz:
	tar --exclude=$(project_name).tar.gz -cvzf $(project_name).tar.gz ../$(project_folder)

metadata: $(pcm_metadata_json) $(project_name).tar.gz
	@ mkdir -p $(generated_metadata_folder)/resources
	@ cp -f ../assets/kiri.png $(generated_metadata_folder)/resources/icon.png
	@ cp -f ${base_metadata_json} $(generated_metadata_folder)/metadata.json
	@ jq ".versions[0].download_sha256 = \"$$(sha256sum $(project_name).tar.gz | cut -d" " -f1)\"" $(generated_metadata_folder)/metadata.json > /tmp/tmp1.json
	@ jq ".versions[0].download_size = $$(du -sb $(project_name).tar.gz | cut -f1)" /tmp/tmp1.json > /tmp/tmp2.json
	@ jq ".versions[0].install_size = $$(du -sb ../$(project_folder) | cut -f1)" /tmp/tmp2.json > /tmp/tmp3.json
	@ cp -f /tmp/tmp3.json $(generated_metadata_folder)/metadata.json
	@ make -s show

show:
	jq -C . $(generated_metadata_folder)/metadata.json

clean:
	rm -rf $(project_name).tar.gz
	rm -rf $(generated_metadata_folder)
